namespace WeeklyWorklist.Api.DTOs.Requests;

public class CarryOverRequestDto
{
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public string? TargetDate { get; set; }
    public List<string>? TaskIds { get; set; }

    public string? SourceStartDate { get; set; }
    public string? SourceEndDate { get; set; }
    public int DaysOffset { get; set; } = 7;

    public string? GetEffectiveStartDate() => StartDate ?? SourceStartDate;
    public string? GetEffectiveEndDate() => EndDate ?? SourceEndDate;
    public string GetEffectiveTargetDate()
    {
        if (!string.IsNullOrWhiteSpace(TargetDate))
        {
            return TargetDate;
        }

        var start = GetEffectiveStartDate();
        if (DateTime.TryParse(start, out var parsedDate))
        {
            return parsedDate.AddDays(DaysOffset).ToString("yyyy-MM-dd");
        }

        return DateTime.UtcNow.ToString("yyyy-MM-dd");
    }
}
