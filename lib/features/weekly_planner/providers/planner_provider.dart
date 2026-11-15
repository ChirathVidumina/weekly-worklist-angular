import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/utils/week_date_utils.dart';
import '../data/models/category_model.dart';
import '../data/models/task_model.dart';
import '../data/repositories/category_repository.dart';
import '../data/repositories/task_repository.dart';

// DI Providers
final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

final taskRepositoryProvider = Provider<TaskRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return TaskRepository(client);
});

final categoryRepositoryProvider = Provider<CategoryRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return CategoryRepository(client);
});

class PlannerState {
  final DateTime selectedWeekStart;
  final String selectedDateKey;
  final List<TaskModel> tasks;
  final List<CategoryModel> categories;
  final bool isLoading;
  final String? errorMessage;
  final String searchQuery;
  final String? priorityFilter;
  final String? categoryFilter;

  const PlannerState({
    required this.selectedWeekStart,
    required this.selectedDateKey,
    this.tasks = const [],
    this.categories = const [],
    this.isLoading = false,
    this.errorMessage,
    this.searchQuery = '',
    this.priorityFilter,
    this.categoryFilter,
  });

  List<TaskModel> get tasksForSelectedDay {
    return tasks.where((t) => t.dateKey == selectedDateKey).toList();
  }

  List<TaskModel> get filteredTasksForSelectedDay {
    return tasks.where((t) {
      if (t.dateKey != selectedDateKey) return false;

      // Search query filter
      if (searchQuery.isNotEmpty) {
        final query = searchQuery.toLowerCase();
        final matchesTitle = t.title.toLowerCase().contains(query);
        final matchesDesc = t.description?.toLowerCase().contains(query) ?? false;
        final matchesCat = t.category.toLowerCase().contains(query);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      // Priority filter
      if (priorityFilter != null && priorityFilter != 'ALL') {
        if (t.priority.toUpperCase() != priorityFilter!.toUpperCase()) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter != null && categoryFilter != 'ALL') {
        if (t.categoryId != categoryFilter) {
          return false;
        }
      }

      return true;
    }).toList()
      ..sort((a, b) {
        // Incomplete first, then by order, then title
        if (a.isCompleted != b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }
        return a.order.compareTo(b.order);
      });
  }

  int get remainingTasksForSelectedDay {
    return tasks.where((t) => t.dateKey == selectedDateKey && !t.isCompleted).length;
  }

  int get totalWeeklyTasks => tasks.length;
  int get completedWeeklyTasks => tasks.where((t) => t.isCompleted).length;

  double get weeklyProgress {
    if (tasks.isEmpty) return 0.0;
    return completedWeeklyTasks / totalWeeklyTasks;
  }

  int countTasksForDate(String dateKey) {
    return tasks.where((t) => t.dateKey == dateKey).length;
  }

  int countRemainingTasksForDate(String dateKey) {
    return tasks.where((t) => t.dateKey == dateKey && !t.isCompleted).length;
  }

  PlannerState copyWith({
    DateTime? selectedWeekStart,
    String? selectedDateKey,
    List<TaskModel>? tasks,
    List<CategoryModel>? categories,
    bool? isLoading,
    String? errorMessage,
    bool clearError = false,
    String? searchQuery,
    String? priorityFilter,
    String? categoryFilter,
    bool clearPriorityFilter = false,
    bool clearCategoryFilter = false,
  }) {
    return PlannerState(
      selectedWeekStart: selectedWeekStart ?? this.selectedWeekStart,
      selectedDateKey: selectedDateKey ?? this.selectedDateKey,
      tasks: tasks ?? this.tasks,
      categories: categories ?? this.categories,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      searchQuery: searchQuery ?? this.searchQuery,
      priorityFilter: clearPriorityFilter ? null : (priorityFilter ?? this.priorityFilter),
      categoryFilter: clearCategoryFilter ? null : (categoryFilter ?? this.categoryFilter),
    );
  }
}

final plannerProvider = StateNotifierProvider<PlannerNotifier, PlannerState>((ref) {
  final taskRepo = ref.watch(taskRepositoryProvider);
  final catRepo = ref.watch(categoryRepositoryProvider);
  return PlannerNotifier(taskRepo, catRepo);
});

class PlannerNotifier extends StateNotifier<PlannerState> {
  final TaskRepository _taskRepository;
  final CategoryRepository _categoryRepository;

  PlannerNotifier(this._taskRepository, this._categoryRepository)
      : super(
          PlannerState(
            selectedWeekStart: WeekDateUtils.getMondayOfWeek(DateTime.now()),
            selectedDateKey: WeekDateUtils.formatDateKey(DateTime.now()),
          ),
        ) {
    loadInitialData();
  }

  Future<void> loadInitialData() async {
    state = state.copyWith(isLoading: true, clearError: true);
    await Future.wait([
      _fetchCategories(),
      _fetchTasksForCurrentWeek(),
    ]);
    state = state.copyWith(isLoading: false);
  }

  Future<void> _fetchCategories() async {
    try {
      final categories = await _categoryRepository.getCategories();
      state = state.copyWith(categories: categories);
    } catch (e) {
      // Non-fatal, fallback to empty/cached categories
    }
  }

  Future<void> _fetchTasksForCurrentWeek() async {
    try {
      final monday = state.selectedWeekStart;
      final sunday = monday.add(const Duration(days: 6));
      final startDate = WeekDateUtils.formatDateKey(monday);
      final endDate = WeekDateUtils.formatDateKey(sunday);

      final tasks = await _taskRepository.getTasks(startDate: startDate, endDate: endDate);
      state = state.copyWith(tasks: tasks, clearError: true);
    } catch (e) {
      state = state.copyWith(errorMessage: e.toString());
    }
  }

  void changeWeek(int weekDelta) {
    final newMonday = state.selectedWeekStart.add(Duration(days: weekDelta * 7));
    // Keep day of week aligned or reset to Monday
    final currentDayOffset = DateTime.now().weekday - 1;
    final newSelectedDate = newMonday.add(Duration(days: currentDayOffset));

    state = state.copyWith(
      selectedWeekStart: newMonday,
      selectedDateKey: WeekDateUtils.formatDateKey(newSelectedDate),
      isLoading: true,
      clearError: true,
    );

    _fetchTasksForCurrentWeek().whenComplete(() {
      state = state.copyWith(isLoading: false);
    });
  }

  void selectToday() {
    final now = DateTime.now();
    final todayMonday = WeekDateUtils.getMondayOfWeek(now);
    final todayKey = WeekDateUtils.formatDateKey(now);

    final isSameWeek = WeekDateUtils.isSameDay(state.selectedWeekStart, todayMonday);

    state = state.copyWith(
      selectedWeekStart: todayMonday,
      selectedDateKey: todayKey,
    );

    if (!isSameWeek) {
      state = state.copyWith(isLoading: true);
      _fetchTasksForCurrentWeek().whenComplete(() {
        state = state.copyWith(isLoading: false);
      });
    }
  }

  void selectDateKey(String dateKey) {
    state = state.copyWith(selectedDateKey: dateKey);
  }

  Future<void> toggleTaskCompletion(String taskId) async {
    final taskIndex = state.tasks.indexWhere((t) => t.id == taskId);
    if (taskIndex == -1) return;

    final current = state.tasks[taskIndex];
    final nextStatus = current.isCompleted ? 'TODO' : 'COMPLETED';
    final completedAt = nextStatus == 'COMPLETED' ? DateTime.now().toUtc().toIso8601String() : null;

    // Optimistic Update
    final updatedList = List<TaskModel>.from(state.tasks);
    updatedList[taskIndex] = current.copyWith(
      status: nextStatus,
      completedAt: completedAt,
    );
    state = state.copyWith(tasks: updatedList);

    try {
      final saved = await _taskRepository.updateTask(taskId, {
        'status': nextStatus,
        if (completedAt != null) 'completedAt': completedAt,
      });

      // Sync state with server response
      final syncedList = List<TaskModel>.from(state.tasks);
      final finalIndex = syncedList.indexWhere((t) => t.id == taskId);
      if (finalIndex != -1) {
        syncedList[finalIndex] = saved;
        state = state.copyWith(tasks: syncedList);
      }
    } catch (e) {
      // Revert optimistic update on error
      final revertedList = List<TaskModel>.from(state.tasks);
      final idx = revertedList.indexWhere((t) => t.id == taskId);
      if (idx != -1) {
        revertedList[idx] = current;
        state = state.copyWith(tasks: revertedList, errorMessage: 'Failed to update status: $e');
      }
    }
  }

  Future<bool> createTask(TaskRequestModel request) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final created = await _taskRepository.createTask(request);
      state = state.copyWith(
        tasks: [...state.tasks, created],
        isLoading: false,
      );
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: 'Create Task Failed: $e');
      return false;
    }
  }

  Future<bool> updateTask(String taskId, Map<String, dynamic> updates) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final updated = await _taskRepository.updateTask(taskId, updates);
      state = state.copyWith(
        tasks: state.tasks.map((t) => t.id == taskId ? updated : t).toList(),
        isLoading: false,
      );
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: 'Update Task Failed: $e');
      return false;
    }
  }

  Future<void> deleteTask(String taskId) async {
    final existing = state.tasks.firstWhere((t) => t.id == taskId, orElse: () => state.tasks.first);
    state = state.copyWith(tasks: state.tasks.where((t) => t.id != taskId).toList());

    try {
      await _taskRepository.deleteTask(taskId);
    } catch (e) {
      // Revert deletion
      state = state.copyWith(
        tasks: [...state.tasks, existing],
        errorMessage: 'Delete Task Failed: $e',
      );
    }
  }

  Future<void> moveTaskToDay(String taskId, String targetDateKey) async {
    await updateTask(taskId, {
      'date': targetDateKey,
      'dateKey': targetDateKey,
    });
  }

  Future<int> carryOverUnfinishedTasks() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final monday = state.selectedWeekStart;
      final sunday = monday.add(const Duration(days: 6));
      final sourceStart = WeekDateUtils.formatDateKey(monday);
      final sourceEnd = WeekDateUtils.formatDateKey(sunday);

      final carriedOver = await _taskRepository.carryOverTasks(
        sourceStartDate: sourceStart,
        sourceEndDate: sourceEnd,
        daysOffset: 7,
      );

      await _fetchTasksForCurrentWeek();
      state = state.copyWith(isLoading: false);
      return carriedOver.length;
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: 'Carry Over Failed: $e');
      return 0;
    }
  }

  Future<bool> addCategory(String name, String color) async {
    try {
      final created = await _categoryRepository.createCategory(name: name, color: color);
      state = state.copyWith(categories: [...state.categories, created]);
      return true;
    } catch (e) {
      state = state.copyWith(errorMessage: 'Create Category Failed: $e');
      return false;
    }
  }

  Future<bool> updateCategory(String id, String name, String color) async {
    try {
      final updated = await _categoryRepository.updateCategory(id: id, name: name, color: color);
      state = state.copyWith(
        categories: state.categories.map((c) => c.id == id ? updated : c).toList(),
      );
      return true;
    } catch (e) {
      state = state.copyWith(errorMessage: 'Update Category Failed: $e');
      return false;
    }
  }

  Future<bool> deleteCategory(String id) async {
    try {
      await _categoryRepository.deleteCategory(id);
      state = state.copyWith(
        categories: state.categories.where((c) => c.id != id).toList(),
      );
      return true;
    } catch (e) {
      state = state.copyWith(errorMessage: 'Delete Category Failed: $e');
      return false;
    }
  }

  void setSearchQuery(String query) => state = state.copyWith(searchQuery: query);
  void setPriorityFilter(String? priority) {
    if (priority == null || priority == 'ALL') {
      state = state.copyWith(clearPriorityFilter: true);
    } else {
      state = state.copyWith(priorityFilter: priority);
    }
  }

  void setCategoryFilter(String? categoryId) {
    if (categoryId == null || categoryId == 'ALL') {
      state = state.copyWith(clearCategoryFilter: true);
    } else {
      state = state.copyWith(categoryFilter: categoryId);
    }
  }

  void clearErrorMessage() => state = state.copyWith(clearError: true);
}
