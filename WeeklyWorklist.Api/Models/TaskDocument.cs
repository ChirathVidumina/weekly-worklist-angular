using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace WeeklyWorklist.Api.Models;

[BsonIgnoreExtraElements]
public class TaskDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("dateKey")]
    public string DateKey { get; set; } = string.Empty;

    [BsonElement("priority")]
    [BsonRepresentation(BsonType.String)]
    public Priority Priority { get; set; } = Priority.MEDIUM;

    [BsonElement("categoryId")]
    public string? CategoryId { get; set; }

    [BsonElement("categoryName")]
    public string? CategoryName { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = "TODO";

    [BsonElement("estimatedMinutes")]
    public int EstimatedMinutes { get; set; } = 30;

    [BsonElement("order")]
    public int Order { get; set; } = 0;

    [BsonElement("tags")]
    public List<string> Tags { get; set; } = new();

    [BsonElement("completedAt")]
    public DateTime? CompletedAt { get; set; }

    [BsonElement("createdAt")]
    public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
}
