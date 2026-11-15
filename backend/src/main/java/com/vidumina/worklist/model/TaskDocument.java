package com.vidumina.worklist.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tasks")
@CompoundIndex(name = "date_order_idx", def = "{'dateKey': 1, 'order': 1}")
public class TaskDocument {

    @Id
    private String id;

    private String title;

    private String description;

    @Indexed
    private String dateKey; // YYYY-MM-DD format

    private Priority priority = Priority.MEDIUM;

    @Indexed
    private String categoryId;

    private String categoryName;

    private String status = "TODO"; // TODO, IN_PROGRESS, COMPLETED

    private Integer estimatedMinutes = 30;

    private Integer order = 0;

    private List<String> tags = new ArrayList<>();

    private Instant completedAt;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public TaskDocument() {
    }

    public TaskDocument(String id, String title, String description, String dateKey, Priority priority,
                        String categoryId, String categoryName, String status, Integer estimatedMinutes,
                        Integer order, List<String> tags) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dateKey = dateKey;
        this.priority = priority;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.status = status;
        this.estimatedMinutes = estimatedMinutes;
        this.order = order;
        this.tags = tags != null ? tags : new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDateKey() {
        return dateKey;
    }

    public void setDateKey(String dateKey) {
        this.dateKey = dateKey;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getEstimatedMinutes() {
        return estimatedMinutes;
    }

    public void setEstimatedMinutes(Integer estimatedMinutes) {
        this.estimatedMinutes = estimatedMinutes;
    }

    public Integer getOrder() {
        return order;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
