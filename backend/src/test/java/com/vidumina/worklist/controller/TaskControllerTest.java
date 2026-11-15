package com.vidumina.worklist.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.vidumina.worklist.dto.request.CarryOverRequestDTO;
import com.vidumina.worklist.dto.request.ReorderTaskDTO;
import com.vidumina.worklist.dto.request.TaskRequestDTO;
import com.vidumina.worklist.dto.response.TaskResponseDTO;
import com.vidumina.worklist.exception.GlobalExceptionHandler;
import com.vidumina.worklist.exception.ResourceNotFoundException;
import com.vidumina.worklist.model.Priority;
import com.vidumina.worklist.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class TaskControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Mock
    private TaskService taskService;

    @InjectMocks
    private TaskController taskController;

    private TaskResponseDTO sampleResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(taskController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        sampleResponse = new TaskResponseDTO();
        sampleResponse.setId("task-001");
        sampleResponse.setTitle("Weekly Team Sync");
        sampleResponse.setDateKey("2026-11-16");
        sampleResponse.setDate("2026-11-16");
        sampleResponse.setPriority(Priority.HIGH);
        sampleResponse.setCategoryId("cat-work");
        sampleResponse.setCategory("Work");
        sampleResponse.setStatus("TODO");
        sampleResponse.setEstimatedMinutes(45);
        sampleResponse.setOrder(0);
    }

    @Test
    @DisplayName("GET /api/v1/tasks returns 200 and list of tasks")
    void getTasks_shouldReturnTaskList() throws Exception {
        when(taskService.getTasks("2026-11-16", "2026-11-22")).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/v1/tasks")
                        .param("startDate", "2026-11-16")
                        .param("endDate", "2026-11-22")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is("task-001")))
                .andExpect(jsonPath("$[0].title", is("Weekly Team Sync")));
    }

    @Test
    @DisplayName("POST /api/v1/tasks returns 201 Created on valid input")
    void createTask_valid_shouldReturn201() throws Exception {
        TaskRequestDTO request = new TaskRequestDTO();
        request.setTitle("Build Microservice");
        request.setDateKey("2026-11-16");
        request.setPriority(Priority.URGENT);

        when(taskService.createTask(any(TaskRequestDTO.class))).thenReturn(sampleResponse);

        mockMvc.perform(post("/api/v1/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is("task-001")));
    }

    @Test
    @DisplayName("POST /api/v1/tasks returns 400 Bad Request on blank title")
    void createTask_blankTitle_shouldReturn400() throws Exception {
        TaskRequestDTO request = new TaskRequestDTO();
        request.setTitle(""); // Invalid: blank

        mockMvc.perform(post("/api/v1/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("VALIDATION_FAILED")));
    }

    @Test
    @DisplayName("PUT /api/v1/tasks/{id} returns 200 on update")
    void updateTask_shouldReturn200() throws Exception {
        TaskRequestDTO request = new TaskRequestDTO();
        request.setTitle("Updated Sync");
        request.setDateKey("2026-11-16");

        when(taskService.updateTask(eq("task-001"), any(TaskRequestDTO.class))).thenReturn(sampleResponse);

        mockMvc.perform(put("/api/v1/tasks/task-001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("task-001")));
    }

    @Test
    @DisplayName("PATCH /api/v1/tasks/reorder updates ordering and returns 200")
    void reorderTasks_shouldReturn200() throws Exception {
        List<ReorderTaskDTO> payload = List.of(new ReorderTaskDTO("task-001", "2026-11-17", 0));
        when(taskService.reorderTasks(any())).thenReturn(List.of(sampleResponse));

        mockMvc.perform(patch("/api/v1/tasks/reorder")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    @DisplayName("DELETE /api/v1/tasks/{id} returns 204 No Content")
    void deleteTask_shouldReturn204() throws Exception {
        doNothing().when(taskService).deleteTask("task-001");

        mockMvc.perform(delete("/api/v1/tasks/task-001"))
                .andExpect(status().isNoContent());

        verify(taskService).deleteTask("task-001");
    }

    @Test
    @DisplayName("GET /api/v1/tasks/{id} returns 404 if not found")
    void getTaskById_notFound_shouldReturn404() throws Exception {
        when(taskService.getTaskById("missing-id"))
                .thenThrow(new ResourceNotFoundException("Task not found with id: missing-id"));

        mockMvc.perform(get("/api/v1/tasks/missing-id"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error", is("RESOURCE_NOT_FOUND")));
    }
}
