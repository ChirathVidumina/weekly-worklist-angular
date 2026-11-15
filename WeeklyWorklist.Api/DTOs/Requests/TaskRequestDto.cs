using System.ComponentModel.DataAnnotations;
using WeeklyWorklist.Api.Models;

namespace WeeklyWorklist.Api.DTOs.Requests;

public class TaskRequestDto
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(200, MinimumLength = 3, ErrorMessage = "Title must be between 3 and 200 characters")]
    public string Title { get; set; } = string.Empty;

    [StringLength(2000, ErrorMessage = "Description cannot exceed 2000 characters")]
    public string? Description { get; set; }

    [RegularExpression(@"^\d{4}-\d{2}-\d{2}$", ErrorMessage = "Date must follow YYYY-MM-DD pattern")]
    public string? DateKey { get; set; }

    [RegularExpression(@"^\d{4}-\d{2}-\d{2}$", ErrorMessage = "Date must follow YYYY-MM-DD pattern")]
    public string? Date { get; set; }

    public Priority Priority { get; set; } = Priority.MEDIUM;

    public string? CategoryId { get; set; }

    public string? Category { get; set; }

    [RegularExpression(@"^(TODO|IN_PROGRESS|COMPLETED)$", ErrorMessage = "Status must be TODO, IN_PROGRESS, or COMPLETED")]
    public string Status { get; set; } = "TODO";

    [Range(0, 1440, ErrorMessage = "Estimated duration cannot be negative")]
    public int EstimatedMinutes { get; set; } = 30;

    public int? Order { get; set; }

    public List<string>? Tags { get; set; }

    public string GetEffectiveDateKey() => DateKey ?? Date ?? DateTime.UtcNow.ToString("yyyy-MM-dd");
}
