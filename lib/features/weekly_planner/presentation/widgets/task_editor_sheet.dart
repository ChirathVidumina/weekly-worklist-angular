import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/week_date_utils.dart';
import '../../data/models/category_model.dart';
import '../../data/models/task_model.dart';
import '../../providers/planner_provider.dart';

class TaskEditorSheet extends ConsumerStatefulWidget {
  final TaskModel? initialTask;
  final String defaultDateKey;

  const TaskEditorSheet({
    super.key,
    this.initialTask,
    required this.defaultDateKey,
  });

  static Future<void> show(
    BuildContext context, {
    TaskModel? task,
    required String defaultDateKey,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => TaskEditorSheet(
        initialTask: task,
        defaultDateKey: defaultDateKey,
      ),
    );
  }

  @override
  ConsumerState<TaskEditorSheet> createState() => _TaskEditorSheetState();
}

class _TaskEditorSheetState extends ConsumerState<TaskEditorSheet> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _titleController;
  late TextEditingController _descController;
  late TextEditingController _minutesController;

  late String _selectedDateKey;
  late String _selectedPriority;
  String? _selectedCategoryId;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    final task = widget.initialTask;
    _titleController = TextEditingController(text: task?.title ?? '');
    _descController = TextEditingController(text: task?.description ?? '');
    _minutesController = TextEditingController(
      text: (task?.estimatedMinutes ?? 30).toString(),
    );

    _selectedDateKey = task?.dateKey ?? widget.defaultDateKey;
    _selectedPriority = task?.priority ?? 'MEDIUM';
    _selectedCategoryId = task?.categoryId;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _minutesController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);
    final notifier = ref.read(plannerProvider.notifier);
    final plannerState = ref.read(plannerProvider);

    // Resolve category name
    final category = plannerState.categories.firstWhere(
      (c) => c.id == _selectedCategoryId,
      orElse: () => plannerState.categories.isNotEmpty
          ? plannerState.categories.first
          : const CategoryModel(id: '', name: 'Work', color: '#6366F1'),
    );

    final title = _titleController.text.trim();
    final desc = _descController.text.trim();
    final minutes = int.tryParse(_minutesController.text.trim()) ?? 30;

    bool success = false;
    if (widget.initialTask == null) {
      // Create Task
      final req = TaskRequestModel(
        title: title,
        description: desc.isNotEmpty ? desc : null,
        dateKey: _selectedDateKey,
        priority: _selectedPriority,
        categoryId: category.id.isNotEmpty ? category.id : null,
        category: category.name,
        estimatedMinutes: minutes,
      );
      success = await notifier.createTask(req);
    } else {
      // Update Task
      final updates = <String, dynamic>{
        'title': title,
        'description': desc,
        'dateKey': _selectedDateKey,
        'date': _selectedDateKey,
        'priority': _selectedPriority,
        'categoryId': category.id.isNotEmpty ? category.id : null,
        'category': category.name,
        'estimatedMinutes': minutes,
      };
      success = await notifier.updateTask(widget.initialTask!.id, updates);
    }

    if (mounted) {
      setState(() => _isSubmitting = false);
      if (success) {
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final plannerState = ref.watch(plannerProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isEditing = widget.initialTask != null;

    final weekDays = WeekDateUtils.getWeekDates(plannerState.selectedWeekStart);

    // Default to first category if none selected
    if (_selectedCategoryId == null && plannerState.categories.isNotEmpty) {
      _selectedCategoryId = plannerState.categories.first.id;
    }

    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Handle bar
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkBorder : const Color(0xFFCBD5E1),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Header Title
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      isEditing ? 'Edit Task' : 'New Task',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 20),
                      onPressed: () => Navigator.pop(context),
                      visualDensity: VisualDensity.compact,
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Title Input
                TextFormField(
                  controller: _titleController,
                  autofocus: !isEditing,
                  textCapitalization: TextCapitalization.sentences,
                  decoration: const InputDecoration(
                    labelText: 'Task Title *',
                    hintText: 'e.g. Complete quarterly financial review',
                  ),
                  validator: (val) {
                    if (val == null || val.trim().length < 2) {
                      return 'Title must be at least 2 characters';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 14),

                // Description Input
                TextFormField(
                  controller: _descController,
                  maxLines: 2,
                  textCapitalization: TextCapitalization.sentences,
                  decoration: const InputDecoration(
                    labelText: 'Description (optional)',
                    hintText: 'Add details, sub-notes or checklists...',
                  ),
                ),
                const SizedBox(height: 16),

                // Scheduled Day Selector
                const Text(
                  'Scheduled Day',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  height: 44,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: weekDays.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, idx) {
                      final day = weekDays[idx];
                      final dateKey = WeekDateUtils.formatDateKey(day);
                      final isSelected = dateKey == _selectedDateKey;

                      return ChoiceChip(
                        label: Text(
                          '${WeekDateUtils.formatDayName(day)} ${day.day}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            color: isSelected ? Colors.white : null,
                          ),
                        ),
                        selected: isSelected,
                        selectedColor: AppColors.primary,
                        onSelected: (_) {
                          setState(() => _selectedDateKey = dateKey);
                        },
                      );
                    },
                  ),
                ),
                const SizedBox(height: 16),

                // Priority Selection
                const Text(
                  'Priority',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                Row(
                  children: ['LOW', 'MEDIUM', 'HIGH'].map((priority) {
                    final isSelected = _selectedPriority == priority;
                    final color = AppColors.getPriorityColor(priority);

                    return Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            backgroundColor: isSelected ? color.withOpacity(0.15) : null,
                            side: BorderSide(
                              color: isSelected ? color : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
                              width: isSelected ? 1.5 : 1,
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          onPressed: () => setState(() => _selectedPriority = priority),
                          child: Text(
                            priority,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: isSelected ? color : (isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary),
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),

                // Category & Duration Row
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Category Dropdown
                    Expanded(
                      flex: 3,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Category',
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 8),
                          DropdownButtonFormField<String>(
                            value: _selectedCategoryId,
                            isExpanded: true,
                            decoration: const InputDecoration(
                              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            ),
                            items: plannerState.categories.map((cat) {
                              final catColor = AppColors.parseHex(cat.color);
                              return DropdownMenuItem<String>(
                                value: cat.id,
                                child: Row(
                                  children: [
                                    Container(
                                      width: 10,
                                      height: 10,
                                      decoration: BoxDecoration(
                                        color: catColor,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        cat.name,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(fontSize: 13),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) setState(() => _selectedCategoryId = val);
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Duration Input
                    Expanded(
                      flex: 2,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Est. Time (min)',
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _minutesController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(
                              suffixText: 'min',
                              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            ),
                            validator: (val) {
                              if (val == null || int.tryParse(val.trim()) == null) {
                                return 'Invalid';
                              }
                              return null;
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isDark ? AppColors.primaryLight : AppColors.primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: _isSubmitting ? null : _submit,
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : Text(
                            isEditing ? 'Save Changes' : 'Create Task',
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
