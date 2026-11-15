using System.Text.Json.Serialization;

namespace WeeklyWorklist.Api.DTOs.Responses;

public class ApiErrorResponse
{
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public int Status { get; set; }
    public string Error { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public Dictionary<string, string>? FieldErrors { get; set; }

    public ApiErrorResponse()
    {
    }

    public ApiErrorResponse(int status, string error, string message, string path, Dictionary<string, string>? fieldErrors = null)
    {
        Status = status;
        Error = error;
        Message = message;
        Path = path;
        FieldErrors = fieldErrors;
    }
}
