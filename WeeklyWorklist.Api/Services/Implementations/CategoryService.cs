using WeeklyWorklist.Api.Common.Exceptions;
using WeeklyWorklist.Api.DTOs.Requests;
using WeeklyWorklist.Api.DTOs.Responses;
using WeeklyWorklist.Api.Models;
using WeeklyWorklist.Api.Repositories.Interfaces;
using WeeklyWorklist.Api.Services.Interfaces;

namespace WeeklyWorklist.Api.Services.Implementations;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly ITaskRepository _taskRepository;
    private readonly ILogger<CategoryService> _logger;

    public CategoryService(
        ICategoryRepository categoryRepository,
        ITaskRepository taskRepository,
        ILogger<CategoryService> logger)
    {
        _categoryRepository = categoryRepository;
        _taskRepository = taskRepository;
        _logger = logger;
    }

    public async Task<List<CategoryResponseDto>> GetAllAsync()
    {
        var list = await _categoryRepository.GetAllAsync();
        return list.Select(MapToResponseDto).ToList();
    }

    public async Task<CategoryResponseDto> GetByIdAsync(string id)
    {
        var category = await _categoryRepository.GetByIdAsync(id)
            ?? throw new ResourceNotFoundException($"Category not found with id: {id}");

        return MapToResponseDto(category);
    }

    public async Task<CategoryResponseDto> CreateAsync(CategoryRequestDto request)
    {
        var trimmedName = request.Name.Trim();
        if (await _categoryRepository.ExistsByNameAsync(trimmedName))
        {
            throw new DuplicateResourceException($"Category with name '{trimmedName}' already exists");
        }

        var doc = new CategoryDocument
        {
            Name = trimmedName,
            Color = request.Color.Trim(),
            IsDefault = false
        };

        var created = await _categoryRepository.CreateAsync(doc);
        _logger.LogInformation("Created new category id={Id}, name={Name}", created.Id, created.Name);
        return MapToResponseDto(created);
    }

    public async Task<CategoryResponseDto> UpdateAsync(string id, CategoryRequestDto request)
    {
        var category = await _categoryRepository.GetByIdAsync(id)
            ?? throw new ResourceNotFoundException($"Category not found with id: {id}");

        var trimmedName = request.Name.Trim();
        if (await _categoryRepository.ExistsByNameAsync(trimmedName, id))
        {
            throw new DuplicateResourceException($"Another category with name '{trimmedName}' already exists");
        }

        category.Name = trimmedName;
        category.Color = request.Color.Trim();

        var updated = await _categoryRepository.UpdateAsync(category);
        _logger.LogInformation("Updated category id={Id}, name={Name}", updated.Id, updated.Name);

        return MapToResponseDto(updated);
    }

    public async Task DeleteAsync(string id)
    {
        var category = await _categoryRepository.GetByIdAsync(id)
            ?? throw new ResourceNotFoundException($"Category not found with id: {id}");

        if (category.IsDefault)
        {
            throw new ArgumentException($"Default category '{category.Name}' cannot be deleted");
        }

        var reassignedCount = await _taskRepository.ReassignCategoryOnTasksAsync(id, "Uncategorized");
        _logger.LogInformation("Reassigned {Count} tasks from deleted category '{Name}' to 'Uncategorized'", reassignedCount, category.Name);

        await _categoryRepository.DeleteAsync(id);
        _logger.LogInformation("Deleted category id={Id}, name={Name}", id, category.Name);
    }

    private static CategoryResponseDto MapToResponseDto(CategoryDocument doc) => new()
    {
        Id = doc.Id ?? string.Empty,
        Name = doc.Name,
        Color = doc.Color,
        IsDefault = doc.IsDefault,
        CreatedAt = doc.CreatedAt,
        UpdatedAt = doc.UpdatedAt
    };
}
