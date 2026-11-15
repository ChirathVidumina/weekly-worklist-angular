package com.vidumina.worklist.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class ReorderTaskDTO {

    @NotBlank(message = "Task ID is required for reordering")
    private String id;

    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Date must follow YYYY-MM-DD pattern")
    private String dateKey;

    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Date must follow YYYY-MM-DD pattern")
    private String date;

    @NotNull(message = "Order position is required")
    @Min(value = 0, message = "Order position cannot be negative")
    private Integer order;

    public ReorderTaskDTO() {
    }

    public ReorderTaskDTO(String id, String dateKey, Integer order) {
        this.id = id;
        this.dateKey = dateKey;
        this.order = order;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public Integer getOrder() {
        return order;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }
}
