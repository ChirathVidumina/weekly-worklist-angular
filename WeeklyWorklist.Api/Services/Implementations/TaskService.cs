using WeeklyWorklist.Api.Common.Exceptions;
using WeeklyWorklist.Api.DTOs.Requests;
using WeeklyWorklist.Api.DTOs.Responses;
using WeeklyWorklist.Api.Models;
using WeeklyWorklist.Api.Repositories.Interfaces;
using WeeklyWorklist.Api.Services.Interfaces;

namespace WeeklyWorklist.Api.Services.Implementations;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly ILogger<TaskService> _logger;

    public TaskService(
        ITaskRepository taskRepository,
        ICategoryRepository categoryRepository,
        ILogger<TaskService> logger)
    {
        _taskRepository = taskRepository;
        _categoryRepository = categoryRepository;
        _logger = logger;
    }

    public async Task<List<TaskResponseDto>> GetTasksAsync(string? startDate, string? endDate)
    {
        List<TaskDocument> tasks;
        if (!string.IsNullOrWhiteSpace(startDate) && !string.IsNullOrWhiteSpace(endDate))
        {
            tasks = await _taskRepository.GetByDateRangeAsync(startDate, endDate);
        }
        else
        {
            tasks = await _taskRepository.GetAllAsync();
        }

        return tasks.Select(MapToResponseDto).ToList();
    }

    public async Task<TaskResponseDto> GetTaskByIdAsync(string id)
    {
        var task = await _taskRepository.GetByIdAsync(id)
            ?? throw new ResourceNotFoundException($"Task not found with id: {id}");

        return MapToResponseDto(task);
    }

    public async Task<TaskResponseDto> CreateTaskAsync(TaskRequestDto request)
    {
        var dateKey = request.GetEffectiveDateKey();
        var (resolvedCategoryId, categoryName) = await ResolveCategoryAsync(request.CategoryId, request.Category);

        var order = request.Order ?? 0;
        if (request.Order == null || request.Order == 0)
        {
            var dayTasks = await _taskRepository.GetByDateKeyAsync(dateKey);
            order = dayTasks.Count == 0 ? 0 : dayTasks.Max(t => t.Order) + 1;
        }

        var doc = new TaskDocument
        {
            Title = request.Title.Trim(),
            Description = request.Description,
            DateKey = dateKey,
            Priority = request.Priority,
            CategoryId = resolvedCategoryId,
            CategoryName = categoryName,
            Status = string.IsNullOrWhiteSpace(request.Status) ? "TODO" : request.Status.ToUpperInvariant(),
            EstimatedMinutes = request.EstimatedMinutes,
            Order = order,
            Tags = request.Tags ?? new List<string>()
        };

        if (doc.Status == "COMPLETED")
        {
            doc.CompletedAt = DateTime.UtcNow;
        }

        var created = await _taskRepository.CreateAsync(doc);
        _logger.LogInformation("Created task id={Id}, title={Title}, dateKey={DateKey}", created.Id, created.Title, created.DateKey);

        return MapToResponseDto(created);
    }

    public async Task<TaskResponseDto> UpdateTaskAsync(string id, TaskRequestDto request)
    {
        var existing = await _taskRepository.GetByIdAsync(id)
            ?? throw new ResourceNotFoundException($"Task not found with id: {id}");

        var oldStatus = existing.Status;
        var newStatus = string.IsNullOrWhiteSpace(request.Status) ? existing.Status : request.Status.ToUpperInvariant();

        existing.Title = request.Title.Trim();
        existing.Description = request.Description;
        existing.DateKey = request.GetEffectiveDateKey();
        existing.Priority = request.Priority;

        if (!string.IsNullOrWhiteSpace(request.CategoryId) || !string.IsNullOrWhiteSpace(request.Category))
        {
            var (resolvedId, resolvedName) = await ResolveCategoryAsync(
                string.IsNullOrWhiteSpace(request.CategoryId) ? existing.CategoryId : request.CategoryId,
                string.IsNullOrWhiteSpace(request.Category) ? existing.CategoryName : request.Category
            );
            existing.CategoryId = resolvedId;
            existing.CategoryName = resolvedName;
        }

        existing.Status = newStatus;
        existing.EstimatedMinutes = request.EstimatedMinutes;
        
        if (request.Order.HasValue)
        {
            existing.Order = request.Order.Value;
        }

        if (request.Tags != null)
        {
            existing.Tags = request.Tags;
        }

        if (newStatus == "COMPLETED" && oldStatus != "COMPLETED")
        {
            existing.CompletedAt = DateTime.UtcNow;
        }
        else if (newStatus != "COMPLETED")
        {
            existing.CompletedAt = null;
        }

        var updated = await _taskRepository.UpdateAsync(existing);
        _logger.LogInformation("Updated task id={Id}, title={Title}, status={Status}", updated.Id, updated.Title, updated.Status);

        return MapToResponseDto(updated);
    }

    public async Task<List<TaskResponseDto>> ReorderTasksAsync(IEnumerable<ReorderTaskDto> items)
    {
        var itemList = items.ToList();
        if (itemList.Count == 0) return new List<TaskResponseDto>();

        await _taskRepository.BulkUpdateReorderAsync(itemList);
        
        var ids = itemList.Select(i => i.Id).ToList();
        var updated = await _taskRepository.GetByIdsAsync(ids);

        // Preserve input order
        var idIndexMap = itemList.Select((item, index) => new { item.Id, index })
            .ToDictionary(x => x.Id, x => x.index);

        return updated
            .OrderBy(t => idIndexMap.TryGetValue(t.Id ?? string.Empty, out var idx) ? idx : int.MaxValue)
            .Select(MapToResponseDto)
            .ToList();
    }

    public async Task DeleteTaskAsync(string id)
    {
        var deleted = await _taskRepository.DeleteAsync(id);
        if (!deleted)
        {
            throw new ResourceNotFoundException($"Task not found with id: {id}");
        }
        _logger.LogInformation("Deleted task id={Id}", id);
    }

    public async Task<List<TaskResponseDto>> CarryOverTasksAsync(CarryOverRequestDto request)
    {
        var targetDate = request.GetEffectiveTargetDate();
        List<TaskDocument> candidateTasks;

        if (request.TaskIds != null && request.TaskIds.Count > 0)
        {
            var tasks = await _taskRepository.GetByIdsAsync(request.TaskIds);
            candidateTasks = tasks.Where(t => t.Status != "COMPLETED").ToList();
        }
        else
        {
            var startDate = request.GetEffectiveStartDate();
            var endDate = request.GetEffectiveEndDate();

            if (!string.IsNullOrWhiteSpace(startDate) && !string.IsNullOrWhiteSpace(endDate))
            {
                candidateTasks = await _taskRepository.GetIncompleteTasksBetweenAsync(startDate, endDate);
            }
            else
            {
                candidateTasks = await _taskRepository.GetIncompleteTasksBeforeAsync(targetDate);
            }
        }

        if (candidateTasks.Count == 0)
        {
            return new List<TaskResponseDto>();
        }

        var targetDayTasks = await _taskRepository.GetByDateKeyAsync(targetDate);
        var nextOrder = targetDayTasks.Count == 0 ? 0 : targetDayTasks.Max(t => t.Order) + 1;

        foreach (var task in candidateTasks)
        {
            task.DateKey = targetDate;
            task.Order = nextOrder++;
        }

        var saved = await _taskRepository.SaveAllAsync(candidateTasks);
        _logger.LogInformation("Carried over {Count} incomplete tasks to target date {TargetDate}", saved.Count, targetDate);

        return saved.Select(MapToResponseDto).ToList();
    }

    public async Task<List<TaskResponseDto>> ImportTasksAsync(IEnumerable<TaskRequestDto> tasks)
    {
        var taskList = tasks.ToList();
        if (taskList.Count == 0) return new List<TaskResponseDto>();

        var documents = new List<TaskDocument>();
        foreach (var req in taskList)
        {
            var (resolvedCatId, categoryName) = await ResolveCategoryAsync(req.CategoryId, req.Category);
            var doc = new TaskDocument
            {
                Title = req.Title.Trim(),
                Description = req.Description,
                DateKey = req.GetEffectiveDateKey(),
                Priority = req.Priority,
                CategoryId = resolvedCatId,
                CategoryName = categoryName,
                Status = string.IsNullOrWhiteSpace(req.Status) ? "TODO" : req.Status.ToUpperInvariant(),
                EstimatedMinutes = req.EstimatedMinutes,
                Order = req.Order ?? 0,
                Tags = req.Tags ?? new List<string>()
            };

            if (doc.Status == "COMPLETED")
            {
                doc.CompletedAt = DateTime.UtcNow;
            }

            documents.Add(doc);
        }

        var saved = await _taskRepository.SaveAllAsync(documents);
        _logger.LogInformation("Imported {Count} tasks", saved.Count);

        return saved.Select(MapToResponseDto).ToList();
    }

    private async Task<(string? CategoryId, string CategoryName)> ResolveCategoryAsync(string? categoryId, string? fallbackCategoryName)
    {
        if (!string.IsNullOrWhiteSpace(categoryId))
        {
            var category = await _categoryRepository.GetByIdAsync(categoryId);
            if (category != null)
            {
                return (category.Id, category.Name);
            }
        }

        if (!string.IsNullOrWhiteSpace(fallbackCategoryName))
        {
            var category = await _categoryRepository.GetByNameAsync(fallbackCategoryName);
            if (category != null)
            {
                return (category.Id, category.Name);
            }
            return (null, fallbackCategoryName);
        }

        var defaultCat = await _categoryRepository.GetByNameAsync("Work");
        return (defaultCat?.Id, defaultCat?.Name ?? "Work");
    }

    private static TaskResponseDto MapToResponseDto(TaskDocument doc) => new()
    {
        Id = doc.Id ?? string.Empty,
        Title = doc.Title,
        Description = doc.Description,
        Date = doc.DateKey,
        DateKey = doc.DateKey,
        Priority = doc.Priority,
        CategoryId = doc.CategoryId,
        Category = doc.CategoryName ?? doc.CategoryId ?? "Work",
        Status = doc.Status,
        EstimatedMinutes = doc.EstimatedMinutes,
        Order = doc.Order,
        Tags = doc.Tags ?? new List<string>(),
        CompletedAt = doc.CompletedAt,
        CreatedAt = doc.CreatedAt,
        UpdatedAt = doc.UpdatedAt
    };
}
