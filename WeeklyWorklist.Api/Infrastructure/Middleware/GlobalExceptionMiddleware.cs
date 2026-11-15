using System.Net;
using System.Text.Json;
using WeeklyWorklist.Api.Common.Constants;
using WeeklyWorklist.Api.Common.Exceptions;
using WeeklyWorklist.Api.DTOs.Responses;

namespace WeeklyWorklist.Api.Infrastructure.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var statusCode = HttpStatusCode.InternalServerError;
        var errorCode = ApiConstants.ErrorCodeInternalError;
        var message = "An unexpected internal error occurred: " + exception.Message;
        Dictionary<string, string>? fieldErrors = null;

        switch (exception)
        {
            case ResourceNotFoundException notFoundEx:
                statusCode = HttpStatusCode.NotFound;
                errorCode = ApiConstants.ErrorCodeResourceNotFound;
                message = notFoundEx.Message;
                _logger.LogWarning("Resource not found: {Message}", notFoundEx.Message);
                break;

            case DuplicateResourceException duplicateEx:
                statusCode = HttpStatusCode.Conflict;
                errorCode = ApiConstants.ErrorCodeDuplicateResource;
                message = duplicateEx.Message;
                _logger.LogWarning("Duplicate resource: {Message}", duplicateEx.Message);
                break;

            case ArgumentException argEx:
                statusCode = HttpStatusCode.BadRequest;
                errorCode = ApiConstants.ErrorCodeValidationFailed;
                message = argEx.Message;
                _logger.LogWarning("Validation failure: {Message}", argEx.Message);
                break;

            case BadHttpRequestException badRequestEx:
                statusCode = HttpStatusCode.BadRequest;
                errorCode = ApiConstants.ErrorCodeValidationFailed;
                message = badRequestEx.Message;
                _logger.LogWarning("Bad HTTP request: {Message}", badRequestEx.Message);
                break;

            default:
                _logger.LogError(exception, "Unhandled exception at {Path}", context.Request.Path);
                break;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = new ApiErrorResponse(
            (int)statusCode,
            errorCode,
            message,
            context.Request.Path.Value ?? "/",
            fieldErrors
        );

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var json = JsonSerializer.Serialize(response, jsonOptions);
        await context.Response.WriteAsync(json);
    }
}
