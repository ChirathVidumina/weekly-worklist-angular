package com.vidumina.worklist.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.util.List;

public class CarryOverRequestDTO {

    private String startDate;

    private String endDate;

    @NotBlank(message = "Target rollover date is required")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Target date must follow YYYY-MM-DD pattern")
    private String targetDate;

    private List<String> taskIds;

    public CarryOverRequestDTO() {
    }

    public CarryOverRequestDTO(String startDate, String endDate, String targetDate, List<String> taskIds) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.targetDate = targetDate;
        this.taskIds = taskIds;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(String targetDate) {
        this.targetDate = targetDate;
    }

    public List<String> getTaskIds() {
        return taskIds;
    }

    public void setTaskIds(List<String> taskIds) {
        this.taskIds = taskIds;
    }
}
