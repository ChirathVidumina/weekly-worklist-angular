package com.vidumina.worklist.service;

import com.vidumina.worklist.dto.request.CarryOverRequestDTO;
import com.vidumina.worklist.dto.request.ReorderTaskDTO;
import com.vidumina.worklist.dto.request.TaskRequestDTO;
import com.vidumina.worklist.dto.response.TaskResponseDTO;

import java.util.List;

public interface TaskService {

    List<TaskResponseDTO> getTasks(String startDate, String endDate);

    TaskResponseDTO getTaskById(String id);

    TaskResponseDTO createTask(TaskRequestDTO request);

    TaskResponseDTO updateTask(String id, TaskRequestDTO request);

    List<TaskResponseDTO> reorderTasks(List<ReorderTaskDTO> items);

    void deleteTask(String id);

    List<TaskResponseDTO> carryOverTasks(CarryOverRequestDTO request);

    List<TaskResponseDTO> importTasks(List<TaskRequestDTO> tasks);
}
