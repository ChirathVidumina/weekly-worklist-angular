using Microsoft.AspNetCore.Mvc;

namespace WeeklyWorklist.Api.Controllers;

[ApiController]
[Route("")]
public class RootController : ControllerBase
{
    [HttpGet]
    public IActionResult GetRoot()
    {
        return Ok(new
        {
            status = "UP",
            application = "Weekly Worklist Management .NET 8 Web API",
            version = "1.0.0",
            timestamp = DateTime.UtcNow,
            documentation = "/swagger",
            apiPrefix = "/api/v1",
            endpoints = new
            {
                tasks = "/api/v1/tasks",
                categories = "/api/v1/categories"
            }
        });
    }
}
