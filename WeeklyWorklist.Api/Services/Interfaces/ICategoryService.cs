using WeeklyWorklist.Api.DTOs.Requests;
using WeeklyWorklist.Api.DTOs.Responses;

namespace WeeklyWorklist.Api.Services.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryResponseDto>> GetAllAsync();
    Task<CategoryResponseDto> GetByIdAsync(string id);
    Task<CategoryResponseDto> CreateAsync(CategoryRequestDto request);
    Task<CategoryResponseDto> UpdateAsync(string id, CategoryRequestDto request);
    Task DeleteAsync(string id);
}
