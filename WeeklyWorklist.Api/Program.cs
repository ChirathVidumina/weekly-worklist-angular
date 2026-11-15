using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using WeeklyWorklist.Api.Common.Constants;
using WeeklyWorklist.Api.DTOs.Responses;
using WeeklyWorklist.Api.Infrastructure.Middleware;
using WeeklyWorklist.Api.Infrastructure.Persistence;
using WeeklyWorklist.Api.Repositories.Implementations;
using WeeklyWorklist.Api.Repositories.Interfaces;
using WeeklyWorklist.Api.Services.Implementations;
using WeeklyWorklist.Api.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Dynamic port configuration (e.g. Render assigns $PORT)
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Controllers & JSON configuration (Strict camelCase and Enum string conversion)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Standardized 400 Validation Error Response matching Spring Boot RFC-7807 structure
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(e => e.Value?.Errors.Count > 0)
            .ToDictionary(
                kvp => JsonNamingPolicy.CamelCase.ConvertName(kvp.Key),
                kvp => kvp.Value!.Errors.First().ErrorMessage
            );

        var errorResponse = new ApiErrorResponse(
            StatusCodes.Status400BadRequest,
            ApiConstants.ErrorCodeValidationFailed,
            "Request validation failed",
            context.HttpContext.Request.Path.Value ?? "/",
            errors
        );

        return new BadRequestObjectResult(errorResponse);
    };
});

// Dynamic CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultCorsPolicy", policy =>
    {
        var allowedOriginsStr = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")
            ?? builder.Configuration["ALLOWED_ORIGINS"]
            ?? "http://localhost:4200,http://127.0.0.1:4200";

        var origins = allowedOriginsStr
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToArray();

        policy.SetIsOriginAllowed(origin =>
        {
            if (origins.Contains("*")) return true;
            return origins.Any(o => string.Equals(o, origin, StringComparison.OrdinalIgnoreCase));
        })
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

// Swagger / OpenAPI documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Cadence Weekly Worklist Management API (.NET 8)",
        Version = "v1",
        Description = "ASP.NET Core 8 Web API 100% drop-in replacement for the Spring Boot backend using official MongoDB.Driver"
    });
});

// Dependency Injection
builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddScoped<ICategoryRepository, MongoCategoryRepository>();
builder.Services.AddScoped<ITaskRepository, MongoTaskRepository>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ITaskService, TaskService>();

var app = builder.Build();

// Global Exception Handling Middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

// Enable Swagger UI for development and production discovery
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Cadence API v1");
    c.RoutePrefix = "swagger";
});

// Provide backward compatibility redirect for Spring Boot /swagger-ui.html
app.MapGet("/swagger-ui.html", () => Results.Redirect("/swagger/index.html"));

app.UseCors("DefaultCorsPolicy");

app.MapControllers();

// Seed initial default categories into MongoDB Atlas if empty
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<MongoDbContext>();
    await DataSeeder.SeedDefaultCategoriesAsync(dbContext);
}

app.Run();
