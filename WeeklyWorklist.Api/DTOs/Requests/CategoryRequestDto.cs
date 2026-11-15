using System.ComponentModel.DataAnnotations;

namespace WeeklyWorklist.Api.DTOs.Requests;

public class CategoryRequestDto
{
    [Required(ErrorMessage = "Category name is required")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Category name must be between 2 and 50 characters")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Category color is required")]
    [RegularExpression(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "Color must be a valid hex code (e.g. #3B82F6)")]
    public string Color { get; set; } = string.Empty;
}
