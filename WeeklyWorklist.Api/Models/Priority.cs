using System.Text.Json.Serialization;

namespace WeeklyWorklist.Api.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Priority
{
    LOW,
    MEDIUM,
    HIGH,
    URGENT
}
