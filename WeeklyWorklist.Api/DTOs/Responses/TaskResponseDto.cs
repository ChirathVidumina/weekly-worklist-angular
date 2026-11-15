using WeeklyWorklist.Api.Models;

namespace WeeklyWorklist.Api.DTOs.Responses;

public class TaskResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Date { get; set; } = string.Empty;
    public string DateKey { get; set; } = string.Empty;
    public Priority Priority { get; set; } = Priority.MEDIUM;
    public string? CategoryId { get; set; }
    public string? Category { get; set; }
    public string Status { get; set; } = "TODO";
    public int EstimatedMinutes { get; set; }
    public int Order { get; set; }
    public List<string> Tags { get; set; } = new();
    public DateTime? CompletedAt { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
