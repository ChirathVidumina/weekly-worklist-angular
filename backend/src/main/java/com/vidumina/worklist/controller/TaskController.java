package com.vidumina.worklist.controller;

import com.vidumina.worklist.constant.ApiConstants;
import com.vidumina.worklist.dto.request.CarryOverRequestDTO;
import com.vidumina.worklist.dto.request.ReorderTaskDTO;
import com.vidumina.worklist.dto.request.TaskRequestDTO;
import com.vidumina.worklist.dto.response.TaskResponseDTO;
import com.vidumina.worklist.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiConstants.TASKS_PATH)
@Tag(name = "Tasks", description = "Operations for weekly work items, scheduling, drag-and-drop reordering, and carry-over")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    @Operation(summary = "Fetch tasks", description = "Query tasks within an optional date range [startDate, endDate] or all tasks")
    public ResponseEntity<List<TaskResponseDTO>> getTasks(
            @Parameter(description = "Start date in YYYY-MM-DD format") @RequestParam(required = false) String startDate,
            @Parameter(description = "End date in YYYY-MM-DD format") @RequestParam(required = false) String endDate) {
        List<TaskResponseDTO> tasks = taskService.getTasks(startDate, endDate);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID", description = "Retrieve a specific task by its unique identifier")
    public ResponseEntity<TaskResponseDTO> getTaskById(@PathVariable String id) {
        TaskResponseDTO task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }

    @PostMapping
    @Operation(summary = "Create a task", description = "Add a new task with schedule date, priority, and category")
    public ResponseEntity<TaskResponseDTO> createTask(@Valid @RequestBody TaskRequestDTO request) {
        TaskResponseDTO created = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update task details", description = "Update task content, priority, category, completion status, or order")
    public ResponseEntity<TaskResponseDTO> updateTask(
            @PathVariable String id,
            @Valid @RequestBody TaskRequestDTO request) {
        TaskResponseDTO updated = taskService.updateTask(id, request);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/reorder")
    @Operation(summary = "Batch reorder tasks", description = "Update dateKey and order sequence after Kanban drag-and-drop actions")
    public ResponseEntity<List<TaskResponseDTO>> reorderTasks(@Valid @RequestBody List<ReorderTaskDTO> items) {
        List<TaskResponseDTO> reordered = taskService.reorderTasks(items);
        return ResponseEntity.ok(reordered);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete task", description = "Permanently remove a task by its identifier")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/carry-over")
    @Operation(summary = "Carry over incomplete tasks", description = "Roll over incomplete tasks from previous days/weeks to a target date")
    public ResponseEntity<List<TaskResponseDTO>> carryOverTasks(@Valid @RequestBody CarryOverRequestDTO request) {
        List<TaskResponseDTO> carriedOver = taskService.carryOverTasks(request);
        return ResponseEntity.ok(carriedOver);
    }

    @PostMapping("/import")
    @Operation(summary = "Bulk import tasks", description = "Import an array of tasks from backup JSON")
    public ResponseEntity<List<TaskResponseDTO>> importTasks(@Valid @RequestBody List<TaskRequestDTO> tasks) {
        List<TaskResponseDTO> imported = taskService.importTasks(tasks);
        return ResponseEntity.status(HttpStatus.CREATED).body(imported);
    }
}
