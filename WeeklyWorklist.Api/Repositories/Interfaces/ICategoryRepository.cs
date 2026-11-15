using WeeklyWorklist.Api.Models;

namespace WeeklyWorklist.Api.Repositories.Interfaces;

public interface ICategoryRepository
{
    Task<List<CategoryDocument>> GetAllAsync();
    Task<CategoryDocument?> GetByIdAsync(string id);
    Task<CategoryDocument?> GetByNameAsync(string name);
    Task<bool> ExistsByNameAsync(string name, string? excludeId = null);
    Task<CategoryDocument> CreateAsync(CategoryDocument category);
    Task<CategoryDocument> UpdateAsync(CategoryDocument category);
    Task<bool> DeleteAsync(string id);
}
