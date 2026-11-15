using Microsoft.AspNetCore.Mvc;
using WeeklyWorklist.Api.Common.Constants;
using WeeklyWorklist.Api.DTOs.Requests;
using WeeklyWorklist.Api.DTOs.Responses;
using WeeklyWorklist.Api.Services.Interfaces;

namespace WeeklyWorklist.Api.Controllers;

[ApiController]
[Route(ApiConstants.TasksRoute)]
[Produces("application/json")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<TaskResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<TaskResponseDto>>> GetTasks([FromQuery] string? startDate, [FromQuery] string? endDate)
    {
        var tasks = await _taskService.GetTasksAsync(startDate, endDate);
        return Ok(tasks);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TaskResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskResponseDto>> GetById(string id)
    {
        var task = await _taskService.GetTaskByIdAsync(id);
        return Ok(task);
    }

    [HttpPost]
    [ProducesResponseType(typeof(TaskResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TaskResponseDto>> Create([FromBody] TaskRequestDto request)
    {
        var created = await _taskService.CreateTaskAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(TaskResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskResponseDto>> Update(string id, [FromBody] TaskRequestDto request)
    {
        var updated = await _taskService.UpdateTaskAsync(id, request);
        return Ok(updated);
    }

    [HttpPatch("reorder")]
    [ProducesResponseType(typeof(List<TaskResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<List<TaskResponseDto>>> Reorder([FromBody] List<ReorderTaskDto> items)
    {
        var reordered = await _taskService.ReorderTasksAsync(items);
        return Ok(reordered);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string id)
    {
        await _taskService.DeleteTaskAsync(id);
        return NoContent();
    }

    [HttpPost("carry-over")]
    [ProducesResponseType(typeof(List<TaskResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<List<TaskResponseDto>>> CarryOver([FromBody] CarryOverRequestDto request)
    {
        var carriedOver = await _taskService.CarryOverTasksAsync(request);
        return Ok(carriedOver);
    }

    [HttpPost("import")]
    [ProducesResponseType(typeof(List<TaskResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<List<TaskResponseDto>>> Import([FromBody] List<TaskRequestDto> tasks)
    {
        var imported = await _taskService.ImportTasksAsync(tasks);
        return StatusCode(StatusCodes.Status201Created, imported);
    }
}
