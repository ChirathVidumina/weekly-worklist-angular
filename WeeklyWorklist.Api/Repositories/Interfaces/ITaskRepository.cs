using WeeklyWorklist.Api.DTOs.Requests;
using WeeklyWorklist.Api.Models;

namespace WeeklyWorklist.Api.Repositories.Interfaces;

public interface ITaskRepository
{
    Task<List<TaskDocument>> GetAllAsync();
    Task<List<TaskDocument>> GetByDateRangeAsync(string startDate, string endDate);
    Task<List<TaskDocument>> GetByDateKeyAsync(string dateKey);
    Task<TaskDocument?> GetByIdAsync(string id);
    Task<List<TaskDocument>> GetByIdsAsync(IEnumerable<string> ids);
    Task<TaskDocument> CreateAsync(TaskDocument task);
    Task<TaskDocument> UpdateAsync(TaskDocument task);
    Task<bool> DeleteAsync(string id);
    Task<int> BulkUpdateReorderAsync(IEnumerable<ReorderTaskDto> items);
    Task<List<TaskDocument>> GetIncompleteTasksBetweenAsync(string startDate, string endDate);
    Task<List<TaskDocument>> GetIncompleteTasksBeforeAsync(string beforeDate);
    Task<List<TaskDocument>> SaveAllAsync(IEnumerable<TaskDocument> tasks);
    Task<long> ReassignCategoryOnTasksAsync(string categoryId, string fallbackCategoryName = "Uncategorized");
}
