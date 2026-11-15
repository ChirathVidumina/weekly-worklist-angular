import '../../../core/network/api_client.dart';
import '../models/task_model.dart';

class TaskRepository {
  final ApiClient _apiClient;

  TaskRepository(this._apiClient);

  Future<List<TaskModel>> getTasks({String? startDate, String? endDate}) async {
    final queryParams = <String, dynamic>{};
    if (startDate != null) queryParams['startDate'] = startDate;
    if (endDate != null) queryParams['endDate'] = endDate;

    final response = await _apiClient.dio.get('/tasks', queryParameters: queryParams);
    final data = response.data as List<dynamic>;
    return data.map((json) => TaskModel.fromJson(json as Map<String, dynamic>)).toList();
  }

  Future<TaskModel> createTask(TaskRequestModel request) async {
    final response = await _apiClient.dio.post('/tasks', data: request.toJson());
    return TaskModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<TaskModel> updateTask(String id, Map<String, dynamic> updates) async {
    final response = await _apiClient.dio.put('/tasks/$id', data: updates);
    return TaskModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> deleteTask(String id) async {
    await _apiClient.dio.delete('/tasks/$id');
  }

  Future<List<TaskModel>> reorderTasks(List<Map<String, dynamic>> items) async {
    final response = await _apiClient.dio.patch('/tasks/reorder', data: items);
    final data = response.data as List<dynamic>;
    return data.map((json) => TaskModel.fromJson(json as Map<String, dynamic>)).toList();
  }

  Future<List<TaskModel>> carryOverTasks({
    required String sourceStartDate,
    required String sourceEndDate,
    int daysOffset = 7,
  }) async {
    final response = await _apiClient.dio.post(
      '/tasks/carry-over',
      data: {
        'sourceStartDate': sourceStartDate,
        'sourceEndDate': sourceEndDate,
        'daysOffset': daysOffset,
      },
    );
    final data = response.data as List<dynamic>;
    return data.map((json) => TaskModel.fromJson(json as Map<String, dynamic>)).toList();
  }
}
