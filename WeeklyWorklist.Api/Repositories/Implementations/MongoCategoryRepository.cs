using System.Text.RegularExpressions;
using MongoDB.Driver;
using WeeklyWorklist.Api.Infrastructure.Persistence;
using WeeklyWorklist.Api.Models;
using WeeklyWorklist.Api.Repositories.Interfaces;

namespace WeeklyWorklist.Api.Repositories.Implementations;

public class MongoCategoryRepository : ICategoryRepository
{
    private readonly IMongoCollection<CategoryDocument> _collection;

    public MongoCategoryRepository(MongoDbContext dbContext)
    {
        _collection = dbContext.Categories;
    }

    public async Task<List<CategoryDocument>> GetAllAsync()
    {
        return await _collection
            .Find(FilterDefinition<CategoryDocument>.Empty)
            .SortBy(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<CategoryDocument?> GetByIdAsync(string id)
    {
        return await _collection.Find(c => c.Id == id).FirstOrDefaultAsync();
    }

    public async Task<CategoryDocument?> GetByNameAsync(string name)
    {
        var regex = new Regex($"^{Regex.Escape(name.Trim())}$", RegexOptions.IgnoreCase);
        return await _collection.Find(c => regex.IsMatch(c.Name)).FirstOrDefaultAsync();
    }

    public async Task<bool> ExistsByNameAsync(string name, string? excludeId = null)
    {
        var regex = new Regex($"^{Regex.Escape(name.Trim())}$", RegexOptions.IgnoreCase);
        var filter = Builders<CategoryDocument>.Filter.Regex(c => c.Name, new MongoDB.Bson.BsonRegularExpression(regex));

        if (!string.IsNullOrWhiteSpace(excludeId))
        {
            filter &= Builders<CategoryDocument>.Filter.Ne(c => c.Id, excludeId);
        }

        var count = await _collection.CountDocumentsAsync(filter);
        return count > 0;
    }

    public async Task<CategoryDocument> CreateAsync(CategoryDocument category)
    {
        category.CreatedAt = DateTime.UtcNow;
        category.UpdatedAt = DateTime.UtcNow;
        await _collection.InsertOneAsync(category);
        return category;
    }

    public async Task<CategoryDocument> UpdateAsync(CategoryDocument category)
    {
        category.UpdatedAt = DateTime.UtcNow;
        await _collection.ReplaceOneAsync(c => c.Id == category.Id, category);
        return category;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _collection.DeleteOneAsync(c => c.Id == id);
        return result.DeletedCount > 0;
    }
}
