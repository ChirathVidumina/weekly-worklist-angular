using WeeklyWorklist.Api.DTOs.Requests;
using WeeklyWorklist.Api.DTOs.Responses;

namespace WeeklyWorklist.Api.Services.Interfaces;

public interface ITaskService
{
    Task<List<TaskResponseDto>> GetTasksAsync(string? startDate, string? endDate);
    Task<TaskResponseDto> GetTaskByIdAsync(string id);
    Task<TaskResponseDto> CreateTaskAsync(TaskRequestDto request);
    Task<TaskResponseDto> UpdateTaskAsync(string id, UpdateTaskRequestDto request);
    Task<List<TaskResponseDto>> ReorderTasksAsync(IEnumerable<ReorderTaskDto> items);
    Task DeleteTaskAsync(string id);
    Task<List<TaskResponseDto>> CarryOverTasksAsync(CarryOverRequestDto request);
    Task<List<TaskResponseDto>> ImportTasksAsync(IEnumerable<TaskRequestDto> tasks);
}
