package com.vidumina.worklist.mapper;

import com.vidumina.worklist.dto.request.TaskRequestDTO;
import com.vidumina.worklist.dto.response.TaskResponseDTO;
import com.vidumina.worklist.model.Priority;
import com.vidumina.worklist.model.TaskDocument;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;

@Component
public class TaskMapper {

    public TaskResponseDTO toResponseDTO(TaskDocument doc) {
        if (doc == null) {
            return null;
        }

        TaskResponseDTO dto = new TaskResponseDTO();
        dto.setId(doc.getId());
        dto.setTitle(doc.getTitle());
        dto.setDescription(doc.getDescription());
        dto.setDateKey(doc.getDateKey());
        dto.setDate(doc.getDateKey());
        dto.setPriority(doc.getPriority() != null ? doc.getPriority() : Priority.MEDIUM);
        dto.setCategoryId(doc.getCategoryId());
        dto.setCategory(doc.getCategoryName() != null ? doc.getCategoryName() : doc.getCategoryId());
        dto.setStatus(doc.getStatus() != null ? doc.getStatus() : "TODO");
        dto.setEstimatedMinutes(doc.getEstimatedMinutes() != null ? doc.getEstimatedMinutes() : 0);
        dto.setOrder(doc.getOrder() != null ? doc.getOrder() : 0);
        dto.setTags(doc.getTags() != null ? new ArrayList<>(doc.getTags()) : new ArrayList<>());
        dto.setCompletedAt(doc.getCompletedAt());
        dto.setCreatedAt(doc.getCreatedAt());
        dto.setUpdatedAt(doc.getUpdatedAt());

        return dto;
    }

    public TaskDocument toDocument(TaskRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        TaskDocument doc = new TaskDocument();
        doc.setTitle(dto.getTitle());
        doc.setDescription(dto.getDescription());
        doc.setDateKey(dto.getDateKey());
        doc.setPriority(dto.getPriority() != null ? dto.getPriority() : Priority.MEDIUM);
        doc.setCategoryId(dto.getCategoryId());
        doc.setCategoryName(dto.getCategory() != null ? dto.getCategory() : dto.getCategoryId());
        doc.setStatus(dto.getStatus() != null ? dto.getStatus() : "TODO");
        doc.setEstimatedMinutes(dto.getEstimatedMinutes() != null ? dto.getEstimatedMinutes() : 30);
        doc.setOrder(dto.getOrder() != null ? dto.getOrder() : 0);
        doc.setTags(dto.getTags() != null ? new ArrayList<>(dto.getTags()) : new ArrayList<>());

        if ("COMPLETED".equalsIgnoreCase(doc.getStatus())) {
            doc.setCompletedAt(Instant.now());
        }

        return doc;
    }

    public void updateDocument(TaskDocument doc, TaskRequestDTO dto) {
        if (doc == null || dto == null) {
            return;
        }

        if (dto.getTitle() != null) {
            doc.setTitle(dto.getTitle());
        }
        if (dto.getDescription() != null) {
            doc.setDescription(dto.getDescription());
        }
        if (dto.getDateKey() != null) {
            doc.setDateKey(dto.getDateKey());
        }
        if (dto.getPriority() != null) {
            doc.setPriority(dto.getPriority());
        }
        if (dto.getCategoryId() != null) {
            doc.setCategoryId(dto.getCategoryId());
        }
        if (dto.getCategory() != null) {
            doc.setCategoryName(dto.getCategory());
        }
        if (dto.getEstimatedMinutes() != null) {
            doc.setEstimatedMinutes(dto.getEstimatedMinutes());
        }
        if (dto.getOrder() != null) {
            doc.setOrder(dto.getOrder());
        }
        if (dto.getTags() != null) {
            doc.setTags(new ArrayList<>(dto.getTags()));
        }

        if (dto.getStatus() != null) {
            String oldStatus = doc.getStatus();
            String newStatus = dto.getStatus();
            doc.setStatus(newStatus);

            if ("COMPLETED".equalsIgnoreCase(newStatus) && !"COMPLETED".equalsIgnoreCase(oldStatus)) {
                doc.setCompletedAt(Instant.now());
            } else if (!"COMPLETED".equalsIgnoreCase(newStatus)) {
                doc.setCompletedAt(null);
            }
        }
    }
}
