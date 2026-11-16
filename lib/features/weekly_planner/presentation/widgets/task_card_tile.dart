import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/week_date_utils.dart';
import '../../data/models/category_model.dart';
import '../../data/models/task_model.dart';
import '../../providers/planner_provider.dart';

class TaskCardTile extends ConsumerWidget {
  final TaskModel task;
  final VoidCallback onEdit;

  const TaskCardTile({
    super.key,
    required this.task,
    required this.onEdit,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifier = ref.read(plannerProvider.notifier);
    final plannerState = ref.watch(plannerProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final isCompleted = task.isCompleted;
    final priorityColor = AppColors.getPriorityColor(task.priority);

    // Resolve category color
    final categoryModel = plannerState.categories.firstWhere(
      (c) => c.id == task.categoryId || c.name.toLowerCase() == task.category.toLowerCase(),
      orElse: () => plannerState.categories.isNotEmpty
          ? plannerState.categories.first
          : const CategoryModel(id: '', name: 'General', color: '#6366F1'),
    );
    final categoryColor = AppColors.parseHex(categoryModel.color);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.lightCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
          width: 1,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Left Priority Color Stripe
              Container(
                width: 5,
                color: priorityColor,
              ),

              // Completion Checkbox
              Padding(
                padding: const EdgeInsets.only(left: 8),
                child: Checkbox(
                  value: isCompleted,
                  onChanged: (_) => notifier.toggleTaskCompletion(task.id),
                  activeColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
              ),

              // Task Content
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Title
                      Text(
                        task.title,
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          decoration: isCompleted ? TextDecoration.lineThrough : null,
                          color: isCompleted
                              ? (isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted)
                              : (isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary),
                        ),
                      ),

                      if (task.description != null && task.description!.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          task.description!,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 13,
                            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                          ),
                        ),
                      ],

                      const SizedBox(height: 8),

                      // Meta Chips Row: Category, Time Estimate, Priority Tag
                      Wrap(
                        spacing: 6,
                        runSpacing: 4,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          // Category Chip
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: categoryColor.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: categoryColor.withOpacity(0.3), width: 1),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 6,
                                  height: 6,
                                  decoration: BoxDecoration(
                                    color: categoryColor,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  task.category,
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: categoryColor,
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // Time Estimate Badge
                          if (task.estimatedMinutes > 0)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: isDark ? AppColors.darkBorder : const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.access_time_rounded,
                                    size: 11,
                                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                                  ),
                                  const SizedBox(width: 3),
                                  Text(
                                    '${task.estimatedMinutes}m',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w500,
                                      color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),

                          // Priority Label
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: priorityColor.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              task.priority.toUpperCase(),
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: priorityColor,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              // Quick Actions Menu
              PopupMenuButton<String>(
                icon: Icon(
                  Icons.more_vert_rounded,
                  size: 18,
                  color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                ),
                padding: EdgeInsets.zero,
                onSelected: (value) {
                  if (value == 'edit') {
                    onEdit();
                  } else if (value == 'delete') {
                    _confirmDelete(context, ref);
                  } else if (value.startsWith('move_')) {
                    final targetDateKey = value.replaceFirst('move_', '');
                    notifier.moveTaskToDay(task.id, targetDateKey);
                  }
                },
                itemBuilder: (context) {
                  final weekDays = WeekDateUtils.getWeekDates(plannerState.selectedWeekStart);

                  return [
                    const PopupMenuItem(
                      value: 'edit',
                      child: Row(
                        children: [
                          Icon(Icons.edit_outlined, size: 18),
                          SizedBox(width: 10),
                          Text('Edit Task'),
                        ],
                      ),
                    ),
                    PopupMenuItem<String>(
                      child: const Row(
                        children: [
                          Icon(Icons.calendar_today_outlined, size: 18),
                          SizedBox(width: 10),
                          Text('Move to Day'),
                          Spacer(),
                          Icon(Icons.chevron_right, size: 16),
                        ],
                      ),
                      onTap: () {
                        Future.delayed(const Duration(milliseconds: 100), () {
                          if (context.mounted) {
                            _showMoveDayDialog(context, ref, weekDays);
                          }
                        });
                      },
                    ),
                    const PopupMenuDivider(),
                    const PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(Icons.delete_outline, size: 18, color: AppColors.error),
                          SizedBox(width: 10),
                          Text('Delete Task', style: TextStyle(color: AppColors.error)),
                        ],
                      ),
                    ),
                  ];
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showMoveDayDialog(BuildContext context, WidgetRef ref, List<DateTime> weekDays) {
    final notifier = ref.read(plannerProvider.notifier);
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: const Text('Move Task to Day', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
          contentPadding: const EdgeInsets.symmetric(vertical: 12),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: weekDays.map((day) {
              final key = WeekDateUtils.formatDateKey(day);
              final isCurrent = key == task.dateKey;
              return ListTile(
                dense: true,
                title: Text('${WeekDateUtils.formatDayName(day)} (${WeekDateUtils.formatDisplayDate(day)})'),
                trailing: isCurrent ? const Icon(Icons.check, color: AppColors.primary, size: 18) : null,
                onTap: () {
                  Navigator.pop(ctx);
                  if (!isCurrent) {
                    notifier.moveTaskToDay(task.id, key);
                  }
                },
              );
            }).toList(),
          ),
        );
      },
    );
  }

  void _confirmDelete(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: const Text('Delete Task'),
          content: Text('Are you sure you want to delete "${task.title}"?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                foregroundColor: Colors.white,
              ),
              onPressed: () {
                Navigator.pop(ctx);
                ref.read(plannerProvider.notifier).deleteTask(task.id);
              },
              child: const Text('Delete'),
            ),
          ],
        );
      },
    );
  }
}
