using MongoDB.Driver;
using WeeklyWorklist.Api.DTOs.Requests;
using WeeklyWorklist.Api.Infrastructure.Persistence;
using WeeklyWorklist.Api.Models;
using WeeklyWorklist.Api.Repositories.Interfaces;

namespace WeeklyWorklist.Api.Repositories.Implementations;

public class MongoTaskRepository : ITaskRepository
{
    private readonly IMongoCollection<TaskDocument> _collection;

    public MongoTaskRepository(MongoDbContext dbContext)
    {
        _collection = dbContext.Tasks;
    }

    public async Task<List<TaskDocument>> GetAllAsync()
    {
        return await _collection
            .Find(FilterDefinition<TaskDocument>.Empty)
            .SortBy(t => t.DateKey)
            .ThenBy(t => t.Order)
            .ToListAsync();
    }

    public async Task<List<TaskDocument>> GetByDateRangeAsync(string startDate, string endDate)
    {
        var filter = Builders<TaskDocument>.Filter.Gte(t => t.DateKey, startDate.Trim()) &
                     Builders<TaskDocument>.Filter.Lte(t => t.DateKey, endDate.Trim());

        return await _collection
            .Find(filter)
            .SortBy(t => t.DateKey)
            .ThenBy(t => t.Order)
            .ToListAsync();
    }

    public async Task<List<TaskDocument>> GetByDateKeyAsync(string dateKey)
    {
        return await _collection
            .Find(t => t.DateKey == dateKey)
            .SortBy(t => t.Order)
            .ToListAsync();
    }

    public async Task<TaskDocument?> GetByIdAsync(string id)
    {
        if (string.IsNullOrWhiteSpace(id) || !MongoDB.Bson.ObjectId.TryParse(id, out _))
        {
            return null;
        }
        return await _collection.Find(t => t.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<TaskDocument>> GetByIdsAsync(IEnumerable<string> ids)
    {
        var validIds = ids.Where(i => !string.IsNullOrWhiteSpace(i) && MongoDB.Bson.ObjectId.TryParse(i, out _)).ToList();
        if (validIds.Count == 0) return new List<TaskDocument>();
        var filter = Builders<TaskDocument>.Filter.In(t => t.Id, validIds);
        return await _collection.Find(filter).ToListAsync();
    }

    public async Task<TaskDocument> CreateAsync(TaskDocument task)
    {
        task.CreatedAt = DateTime.UtcNow;
        task.UpdatedAt = DateTime.UtcNow;
        await _collection.InsertOneAsync(task);
        return task;
    }

    public async Task<TaskDocument> UpdateAsync(TaskDocument task)
    {
        task.UpdatedAt = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(task.Id) && MongoDB.Bson.ObjectId.TryParse(task.Id, out _))
        {
            await _collection.ReplaceOneAsync(t => t.Id == task.Id, task);
        }
        return task;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        if (string.IsNullOrWhiteSpace(id) || !MongoDB.Bson.ObjectId.TryParse(id, out _))
        {
            return false;
        }
        var result = await _collection.DeleteOneAsync(t => t.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<int> BulkUpdateReorderAsync(IEnumerable<ReorderTaskDto> items)
    {
        var itemList = items.ToList();
        if (itemList.Count == 0) return 0;

        var writes = new List<WriteModel<TaskDocument>>();
        foreach (var item in itemList)
        {
            var updateBuilder = Builders<TaskDocument>.Update
                .Set(t => t.Order, item.Order)
                .Set(t => t.UpdatedAt, DateTime.UtcNow);

            var dateKey = item.GetEffectiveDateKey();
            if (!string.IsNullOrWhiteSpace(dateKey))
            {
                updateBuilder = updateBuilder.Set(t => t.DateKey, dateKey);
            }

            var updateModel = new UpdateOneModel<TaskDocument>(
                Builders<TaskDocument>.Filter.Eq(t => t.Id, item.Id),
                updateBuilder
            );
            writes.Add(updateModel);
        }

        var result = await _collection.BulkWriteAsync(writes);
        return (int)result.ModifiedCount;
    }

    public async Task<List<TaskDocument>> GetIncompleteTasksBetweenAsync(string startDate, string endDate)
    {
        var filter = Builders<TaskDocument>.Filter.Ne(t => t.Status, "COMPLETED") &
                     Builders<TaskDocument>.Filter.Gte(t => t.DateKey, startDate.Trim()) &
                     Builders<TaskDocument>.Filter.Lte(t => t.DateKey, endDate.Trim());

        return await _collection.Find(filter).SortBy(t => t.Order).ToListAsync();
    }

    public async Task<List<TaskDocument>> GetIncompleteTasksBeforeAsync(string beforeDate)
    {
        var filter = Builders<TaskDocument>.Filter.Ne(t => t.Status, "COMPLETED") &
                     Builders<TaskDocument>.Filter.Lt(t => t.DateKey, beforeDate.Trim());

        return await _collection.Find(filter).SortBy(t => t.DateKey).ThenBy(t => t.Order).ToListAsync();
    }

    public async Task<List<TaskDocument>> SaveAllAsync(IEnumerable<TaskDocument> tasks)
    {
        var taskList = tasks.ToList();
        if (taskList.Count == 0) return taskList;

        var writes = new List<WriteModel<TaskDocument>>();
        foreach (var task in taskList)
        {
            task.UpdatedAt = DateTime.UtcNow;
            if (string.IsNullOrEmpty(task.Id))
            {
                task.CreatedAt = DateTime.UtcNow;
                writes.Add(new InsertOneModel<TaskDocument>(task));
            }
            else
            {
                writes.Add(new ReplaceOneModel<TaskDocument>(
                    Builders<TaskDocument>.Filter.Eq(t => t.Id, task.Id),
                    task
                ) { IsUpsert = true });
            }
        }

        await _collection.BulkWriteAsync(writes);
        return taskList;
    }

    public async Task<long> ReassignCategoryOnTasksAsync(string categoryId, string fallbackCategoryName = "Uncategorized")
    {
        var filter = Builders<TaskDocument>.Filter.Eq(t => t.CategoryId, categoryId);
        var update = Builders<TaskDocument>.Update
            .Set(t => t.CategoryId, null)
            .Set(t => t.CategoryName, fallbackCategoryName)
            .Set(t => t.UpdatedAt, DateTime.UtcNow);

        var result = await _collection.UpdateManyAsync(filter, update);
        return result.ModifiedCount;
    }
}
