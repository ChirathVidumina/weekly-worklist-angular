using System.ComponentModel.DataAnnotations;

namespace WeeklyWorklist.Api.DTOs.Requests;

public class ReorderTaskDto
{
    [Required(ErrorMessage = "Task ID is required for reordering")]
    public string Id { get; set; } = string.Empty;

    [RegularExpression(@"^\d{4}-\d{2}-\d{2}$", ErrorMessage = "Date must follow YYYY-MM-DD pattern")]
    public string? DateKey { get; set; }

    [RegularExpression(@"^\d{4}-\d{2}-\d{2}$", ErrorMessage = "Date must follow YYYY-MM-DD pattern")]
    public string? Date { get; set; }

    [Required(ErrorMessage = "Order position is required")]
    [Range(0, int.MaxValue, ErrorMessage = "Order position cannot be negative")]
    public int Order { get; set; }

    public string? GetEffectiveDateKey() => DateKey ?? Date;
}
