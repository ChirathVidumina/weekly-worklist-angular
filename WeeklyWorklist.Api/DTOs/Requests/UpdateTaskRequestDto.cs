using System.ComponentModel.DataAnnotations;
using WeeklyWorklist.Api.Models;

namespace WeeklyWorklist.Api.DTOs.Requests;

public class UpdateTaskRequestDto
{
    [StringLength(200, MinimumLength = 1, ErrorMessage = "Title must not exceed 200 characters")]
    public string? Title { get; set; }

    [StringLength(2000, ErrorMessage = "Description cannot exceed 2000 characters")]
    public string? Description { get; set; }

    [RegularExpression(@"^\d{4}-\d{2}-\d{2}$", ErrorMessage = "Date must follow YYYY-MM-DD pattern")]
    public string? DateKey { get; set; }

    [RegularExpression(@"^\d{4}-\d{2}-\d{2}$", ErrorMessage = "Date must follow YYYY-MM-DD pattern")]
    public string? Date { get; set; }

    public Priority? Priority { get; set; }

    public string? CategoryId { get; set; }

    public string? Category { get; set; }

    [RegularExpression(@"^(TODO|IN_PROGRESS|COMPLETED)$", ErrorMessage = "Status must be TODO, IN_PROGRESS, or COMPLETED")]
    public string? Status { get; set; }

    [Range(0, 1440, ErrorMessage = "Estimated duration cannot be negative")]
    public int? EstimatedMinutes { get; set; }

    public int? Order { get; set; }

    public List<string>? Tags { get; set; }

    public string? CompletedAt { get; set; }

    public string? GetEffectiveDateKey() => DateKey ?? Date;
}
