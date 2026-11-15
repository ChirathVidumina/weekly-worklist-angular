package com.vidumina.worklist.service.impl;

import com.vidumina.worklist.dto.request.CarryOverRequestDTO;
import com.vidumina.worklist.dto.request.ReorderTaskDTO;
import com.vidumina.worklist.dto.request.TaskRequestDTO;
import com.vidumina.worklist.dto.response.TaskResponseDTO;
import com.vidumina.worklist.exception.ResourceNotFoundException;
import com.vidumina.worklist.mapper.TaskMapper;
import com.vidumina.worklist.model.CategoryDocument;
import com.vidumina.worklist.model.TaskDocument;
import com.vidumina.worklist.repository.CategoryMongoRepository;
import com.vidumina.worklist.repository.TaskMongoRepository;
import com.vidumina.worklist.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements TaskService {

    private static final Logger log = LoggerFactory.getLogger(TaskServiceImpl.class);

    private final TaskMongoRepository taskMongoRepository;
    private final CategoryMongoRepository categoryMongoRepository;
    private final TaskMapper taskMapper;

    public TaskServiceImpl(TaskMongoRepository taskMongoRepository,
                           CategoryMongoRepository categoryMongoRepository,
                           TaskMapper taskMapper) {
        this.taskMongoRepository = taskMongoRepository;
        this.categoryMongoRepository = categoryMongoRepository;
        this.taskMapper = taskMapper;
    }

    @Override
    public List<TaskResponseDTO> getTasks(String startDate, String endDate) {
        List<TaskDocument> tasks;
        if (startDate != null && endDate != null && !startDate.isBlank() && !endDate.isBlank()) {
            tasks = taskMongoRepository.findByDateKeyBetweenOrderByDateKeyAscOrderAsc(startDate.trim(), endDate.trim());
        } else {
            tasks = taskMongoRepository.findAllByOrderByDateKeyAscOrderAsc();
        }

        return tasks.stream()
                .map(taskMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TaskResponseDTO getTaskById(String id) {
        TaskDocument task = taskMongoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        return taskMapper.toResponseDTO(task);
    }

    @Override
    public TaskResponseDTO createTask(TaskRequestDTO request) {
        TaskDocument task = taskMapper.toDocument(request);

        // Resolve category name if categoryId is provided
        resolveCategoryMetadata(task, request.getCategoryId(), request.getCategory());

        // Default order placement at end of the date list if not provided
        if (task.getOrder() == null || task.getOrder() == 0) {
            List<TaskDocument> dayTasks = taskMongoRepository.findByDateKeyOrderByOrderAsc(task.getDateKey());
            int nextOrder = dayTasks.isEmpty() ? 0 : dayTasks.get(dayTasks.size() - 1).getOrder() + 1;
            task.setOrder(nextOrder);
        }

        TaskDocument saved = taskMongoRepository.save(task);
        log.info("Created task: id={}, title={}, dateKey={}", saved.getId(), saved.getTitle(), saved.getDateKey());
        return taskMapper.toResponseDTO(saved);
    }

    @Override
    public TaskResponseDTO updateTask(String id, TaskRequestDTO request) {
        TaskDocument existing = taskMongoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        taskMapper.updateDocument(existing, request);
        resolveCategoryMetadata(existing, request.getCategoryId(), request.getCategory());

        TaskDocument updated = taskMongoRepository.save(existing);
        log.info("Updated task: id={}, title={}, status={}", updated.getId(), updated.getTitle(), updated.getStatus());
        return taskMapper.toResponseDTO(updated);
    }

    @Override
    public List<TaskResponseDTO> reorderTasks(List<ReorderTaskDTO> items) {
        if (items == null || items.isEmpty()) {
            return List.of();
        }

        List<String> ids = items.stream().map(ReorderTaskDTO::getId).collect(Collectors.toList());
        Map<String, TaskDocument> taskMap = taskMongoRepository.findByIdIn(ids)
                .stream()
                .collect(Collectors.toMap(TaskDocument::getId, t -> t));

        List<TaskDocument> updatedTasks = new ArrayList<>();
        for (ReorderTaskDTO item : items) {
            TaskDocument doc = taskMap.get(item.getId());
            if (doc != null) {
                if (item.getDateKey() != null && !item.getDateKey().isBlank()) {
                    doc.setDateKey(item.getDateKey());
                }
                if (item.getOrder() != null) {
                    doc.setOrder(item.getOrder());
                }
                updatedTasks.add(doc);
            }
        }

        if (!updatedTasks.isEmpty()) {
            taskMongoRepository.saveAll(updatedTasks);
            log.info("Reordered {} tasks successfully", updatedTasks.size());
        }

        return updatedTasks.stream()
                .map(taskMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteTask(String id) {
        if (!taskMongoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Task not found with id: " + id);
        }
        taskMongoRepository.deleteById(id);
        log.info("Deleted task id={}", id);
    }

    @Override
    public List<TaskResponseDTO> carryOverTasks(CarryOverRequestDTO request) {
        List<TaskDocument> candidateTasks;

        if (request.getTaskIds() != null && !request.getTaskIds().isEmpty()) {
            candidateTasks = taskMongoRepository.findByIdIn(request.getTaskIds())
                    .stream()
                    .filter(t -> !"COMPLETED".equalsIgnoreCase(t.getStatus()))
                    .collect(Collectors.toList());
        } else if (request.getStartDate() != null && request.getEndDate() != null) {
            candidateTasks = taskMongoRepository.findByStatusNotAndDateKeyBetween(
                    "COMPLETED", request.getStartDate(), request.getEndDate());
        } else {
            candidateTasks = taskMongoRepository.findByStatusNotAndDateKeyBefore(
                    "COMPLETED", request.getTargetDate());
        }

        if (candidateTasks.isEmpty()) {
            return List.of();
        }

        // Determine current max order on target date
        List<TaskDocument> targetDayTasks = taskMongoRepository.findByDateKeyOrderByOrderAsc(request.getTargetDate());
        int nextOrder = targetDayTasks.isEmpty() ? 0 : targetDayTasks.get(targetDayTasks.size() - 1).getOrder() + 1;

        for (TaskDocument task : candidateTasks) {
            task.setDateKey(request.getTargetDate());
            task.setOrder(nextOrder++);
        }

        List<TaskDocument> saved = taskMongoRepository.saveAll(candidateTasks);
        log.info("Carried over {} incomplete tasks to target date {}", saved.size(), request.getTargetDate());

        return saved.stream()
                .map(taskMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponseDTO> importTasks(List<TaskRequestDTO> tasks) {
        if (tasks == null || tasks.isEmpty()) {
            return List.of();
        }

        List<TaskDocument> documents = new ArrayList<>();
        for (TaskRequestDTO dto : tasks) {
            TaskDocument doc = taskMapper.toDocument(dto);
            resolveCategoryMetadata(doc, dto.getCategoryId(), dto.getCategory());
            documents.add(doc);
        }

        List<TaskDocument> saved = taskMongoRepository.saveAll(documents);
        log.info("Bulk imported {} tasks successfully", saved.size());

        return saved.stream()
                .map(taskMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    private void resolveCategoryMetadata(TaskDocument task, String categoryId, String categoryNameFallback) {
        if (categoryId != null && !categoryId.isBlank()) {
            Optional<CategoryDocument> catOpt = categoryMongoRepository.findById(categoryId);
            if (catOpt.isPresent()) {
                task.setCategoryId(catOpt.get().getId());
                task.setCategoryName(catOpt.get().getName());
                return;
            }
        }

        if (categoryNameFallback != null && !categoryNameFallback.isBlank()) {
            task.setCategoryName(categoryNameFallback);
        } else if (task.getCategoryName() == null || task.getCategoryName().isBlank()) {
            task.setCategoryName("Work");
        }
    }
}
