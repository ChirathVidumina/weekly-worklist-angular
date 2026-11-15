using MongoDB.Driver;
using WeeklyWorklist.Api.Models;

namespace WeeklyWorklist.Api.Infrastructure.Persistence;

public static class DataSeeder
{
    public static async Task SeedDefaultCategoriesAsync(MongoDbContext dbContext)
    {
        try
        {
            var count = await dbContext.Categories.CountDocumentsAsync(FilterDefinition<CategoryDocument>.Empty);
            if (count == 0)
            {
                var defaults = new List<CategoryDocument>
                {
                    new() { Name = "Work", Color = "#3B82F6", IsDefault = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new() { Name = "Study", Color = "#8B5CF6", IsDefault = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new() { Name = "Personal", Color = "#10B981", IsDefault = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new() { Name = "Urgent", Color = "#EF4444", IsDefault = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
                };

                await dbContext.Categories.InsertManyAsync(defaults);
                Console.WriteLine($"[DataSeeder] Successfully seeded {defaults.Count} default categories into MongoDB Atlas.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DataSeeder] Notice during category seeding: {ex.Message}");
        }
    }
}
