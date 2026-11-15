package com.vidumina.worklist.dto.request;

import com.vidumina.worklist.model.Priority;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public class TaskRequestDTO {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Date must follow YYYY-MM-DD pattern")
    private String dateKey;

    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Date must follow YYYY-MM-DD pattern")
    private String date;

    private Priority priority = Priority.MEDIUM;

    private String categoryId;

    private String category;

    @Pattern(regexp = "^(TODO|IN_PROGRESS|COMPLETED)$", message = "Status must be TODO, IN_PROGRESS, or COMPLETED")
    private String status = "TODO";

    @Min(value = 0, message = "Estimated duration cannot be negative")
    private Integer estimatedMinutes = 30;

    private Integer order;

    private List<String> tags;

    public TaskRequestDTO() {
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
        return dateKey != null ? dateKey : date;
    }

    public void setDateKey(String dateKey) {
        this.dateKey = dateKey;
    }

    public String getDate() {
        return date != null ? date : dateKey;
    }

    public void setDate(String date) {
        this.date = date;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
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
}
