package com.vidumina.worklist.service;

import com.vidumina.worklist.dto.request.CarryOverRequestDTO;
import com.vidumina.worklist.dto.request.ReorderTaskDTO;
import com.vidumina.worklist.dto.request.TaskRequestDTO;
import com.vidumina.worklist.dto.response.TaskResponseDTO;
import com.vidumina.worklist.exception.ResourceNotFoundException;
import com.vidumina.worklist.mapper.TaskMapper;
import com.vidumina.worklist.model.Priority;
import com.vidumina.worklist.model.TaskDocument;
import com.vidumina.worklist.repository.CategoryMongoRepository;
import com.vidumina.worklist.repository.TaskMongoRepository;
import com.vidumina.worklist.service.impl.TaskServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskMongoRepository taskMongoRepository;

    @Mock
    private CategoryMongoRepository categoryMongoRepository;

    @Spy
    private TaskMapper taskMapper = new TaskMapper();

    @InjectMocks
    private TaskServiceImpl taskService;

    private TaskDocument sampleTask;

    @BeforeEach
    void setUp() {
        sampleTask = new TaskDocument(
                "task-123",
                "Implement REST endpoints",
                "Build task and category APIs",
                "2026-11-16",
                Priority.HIGH,
                "cat-work",
                "Work",
                "TODO",
                60,
                0,
                List.of("backend", "spring")
        );
    }

    @Test
    @DisplayName("getTasks with date range queries repository with between dates")
    void getTasks_withDateRange_shouldQueryRepository() {
        when(taskMongoRepository.findByDateKeyBetweenOrderByDateKeyAscOrderAsc("2026-11-16", "2026-11-22"))
                .thenReturn(List.of(sampleTask));

        List<TaskResponseDTO> results = taskService.getTasks("2026-11-16", "2026-11-22");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getId()).isEqualTo("task-123");
        assertThat(results.get(0).getTitle()).isEqualTo("Implement REST endpoints");
        verify(taskMongoRepository, times(1))
                .findByDateKeyBetweenOrderByDateKeyAscOrderAsc("2026-11-16", "2026-11-22");
    }

    @Test
    @DisplayName("createTask assigns next order and persists task")
    void createTask_shouldCalculateOrderAndSave() {
        TaskRequestDTO request = new TaskRequestDTO();
        request.setTitle("New Task");
        request.setDateKey("2026-11-16");
        request.setPriority(Priority.MEDIUM);

        when(taskMongoRepository.findByDateKeyOrderByOrderAsc("2026-11-16"))
                .thenReturn(List.of(sampleTask));
        when(taskMongoRepository.save(any(TaskDocument.class)))
                .thenAnswer(inv -> {
                    TaskDocument doc = inv.getArgument(0);
                    doc.setId("generated-id");
                    return doc;
                });

        TaskResponseDTO created = taskService.createTask(request);

        assertThat(created).isNotNull();
        assertThat(created.getId()).isEqualTo("generated-id");
        assertThat(created.getOrder()).isEqualTo(1); // sampleTask had order 0
        verify(taskMongoRepository, times(1)).save(any(TaskDocument.class));
    }

    @Test
    @DisplayName("updateTask modifies existing task fields and saves")
    void updateTask_shouldUpdateFieldsAndSave() {
        TaskRequestDTO request = new TaskRequestDTO();
        request.setTitle("Updated Task Title");
        request.setStatus("COMPLETED");

        when(taskMongoRepository.findById("task-123")).thenReturn(Optional.of(sampleTask));
        when(taskMongoRepository.save(any(TaskDocument.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskResponseDTO updated = taskService.updateTask("task-123", request);

        assertThat(updated.getTitle()).isEqualTo("Updated Task Title");
        assertThat(updated.getStatus()).isEqualTo("COMPLETED");
        assertThat(updated.getCompletedAt()).isNotNull();
        verify(taskMongoRepository).save(sampleTask);
    }

    @Test
    @DisplayName("updateTask throws ResourceNotFoundException if task does not exist")
    void updateTask_notFound_shouldThrowException() {
        TaskRequestDTO request = new TaskRequestDTO();
        request.setTitle("Non-existent");

        when(taskMongoRepository.findById("unknown-id")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.updateTask("unknown-id", request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("unknown-id");
    }

    @Test
    @DisplayName("reorderTasks updates dateKey and order sequence across tasks")
    void reorderTasks_shouldUpdateDatesAndOrders() {
        TaskDocument task2 = new TaskDocument("task-456", "Task 2", null, "2026-11-16", Priority.LOW,
                "cat-work", "Work", "TODO", 30, 1, new ArrayList<>());

        when(taskMongoRepository.findByIdIn(anyList()))
                .thenReturn(List.of(sampleTask, task2));

        List<ReorderTaskDTO> reorderPayload = List.of(
                new ReorderTaskDTO("task-456", "2026-11-17", 0),
                new ReorderTaskDTO("task-123", "2026-11-17", 1)
        );

        List<TaskResponseDTO> results = taskService.reorderTasks(reorderPayload);

        assertThat(results).hasSize(2);
        assertThat(sampleTask.getDateKey()).isEqualTo("2026-11-17");
        assertThat(sampleTask.getOrder()).isEqualTo(1);
        assertThat(task2.getDateKey()).isEqualTo("2026-11-17");
        assertThat(task2.getOrder()).isEqualTo(0);
        verify(taskMongoRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("carryOverTasks migrates incomplete tasks to target date")
    void carryOverTasks_incompleteTasks_shouldMoveToTargetDate() {
        CarryOverRequestDTO request = new CarryOverRequestDTO("2026-11-09", "2026-11-15", "2026-11-16", null);

        when(taskMongoRepository.findByStatusNotAndDateKeyBetween("COMPLETED", "2026-11-09", "2026-11-15"))
                .thenReturn(List.of(sampleTask));
        when(taskMongoRepository.findByDateKeyOrderByOrderAsc("2026-11-16"))
                .thenReturn(List.of());
        when(taskMongoRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        List<TaskResponseDTO> carriedOver = taskService.carryOverTasks(request);

        assertThat(carriedOver).hasSize(1);
        assertThat(sampleTask.getDateKey()).isEqualTo("2026-11-16");
        assertThat(sampleTask.getOrder()).isEqualTo(0);
        verify(taskMongoRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("deleteTask deletes task if exists or throws if missing")
    void deleteTask_shouldCallRepository() {
        when(taskMongoRepository.existsById("task-123")).thenReturn(true);

        taskService.deleteTask("task-123");

        verify(taskMongoRepository).deleteById("task-123");

        when(taskMongoRepository.existsById("missing")).thenReturn(false);
        assertThatThrownBy(() -> taskService.deleteTask("missing"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
