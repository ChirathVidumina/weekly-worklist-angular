using MongoDB.Driver;
using WeeklyWorklist.Api.Common.Constants;
using WeeklyWorklist.Api.Models;

namespace WeeklyWorklist.Api.Infrastructure.Persistence;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IConfiguration configuration)
    {
        var connectionString = configuration["MONGODB_URI"]
            ?? configuration.GetConnectionString("MongoDb")
            ?? "mongodb://localhost:27017/weekly_worklist_db";

        var mongoUrl = new MongoUrl(connectionString);
        var client = new MongoClient(mongoUrl);
        
        var databaseName = !string.IsNullOrWhiteSpace(mongoUrl.DatabaseName)
            ? mongoUrl.DatabaseName
            : "weekly_worklist_db";

        _database = client.GetDatabase(databaseName);
        InitializeIndexes();
    }

    public IMongoCollection<TaskDocument> Tasks =>
        _database.GetCollection<TaskDocument>(ApiConstants.TasksCollection);

    public IMongoCollection<CategoryDocument> Categories =>
        _database.GetCollection<CategoryDocument>(ApiConstants.CategoriesCollection);

    public IMongoDatabase Database => _database;

    private void InitializeIndexes()
    {
        try
        {
            // 1. Compound index on tasks (dateKey ASC, order ASC)
            var taskIndexKeys = Builders<TaskDocument>.IndexKeys
                .Ascending(t => t.DateKey)
                .Ascending(t => t.Order);
            var taskIndexOptions = new CreateIndexOptions { Name = "date_order_idx" };
            Tasks.Indexes.CreateOne(new CreateIndexModel<TaskDocument>(taskIndexKeys, taskIndexOptions));

            // 2. Index on categoryId for tasks
            var categoryIdKey = Builders<TaskDocument>.IndexKeys.Ascending(t => t.CategoryId);
            Tasks.Indexes.CreateOne(new CreateIndexModel<TaskDocument>(categoryIdKey));

            // 3. Unique case-insensitive index on categories.name
            var categoryNameKey = Builders<CategoryDocument>.IndexKeys.Ascending(c => c.Name);
            var categoryIndexOptions = new CreateIndexOptions
            {
                Name = "category_name_unique_idx",
                Unique = true,
                Collation = new Collation("en", strength: CollationStrength.Secondary)
            };
            Categories.Indexes.CreateOne(new CreateIndexModel<CategoryDocument>(categoryNameKey, categoryIndexOptions));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[MongoDbContext] Index initialization notice: {ex.Message}");
        }
    }
}
