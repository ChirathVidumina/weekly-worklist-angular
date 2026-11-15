import '../../../core/network/api_client.dart';
import '../models/category_model.dart';

class CategoryRepository {
  final ApiClient _apiClient;

  CategoryRepository(this._apiClient);

  Future<List<CategoryModel>> getCategories() async {
    final response = await _apiClient.dio.get('/categories');
    final data = response.data as List<dynamic>;
    return data.map((json) => CategoryModel.fromJson(json as Map<String, dynamic>)).toList();
  }

  Future<CategoryModel> createCategory({required String name, required String color}) async {
    final response = await _apiClient.dio.post(
      '/categories',
      data: {'name': name, 'color': color},
    );
    return CategoryModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<CategoryModel> updateCategory({
    required String id,
    required String name,
    required String color,
  }) async {
    final response = await _apiClient.dio.put(
      '/categories/$id',
      data: {'name': name, 'color': color},
    );
    return CategoryModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> deleteCategory(String id) async {
    await _apiClient.dio.delete('/categories/$id');
  }
}
