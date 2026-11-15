import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/week_date_utils.dart';
import '../../providers/planner_provider.dart';

class WeekSwitcherHeader extends ConsumerWidget {
  const WeekSwitcherHeader({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final plannerState = ref.watch(plannerProvider);
    final notifier = ref.read(plannerProvider.notifier);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final weekRangeText = WeekDateUtils.formatWeekRange(plannerState.selectedWeekStart);
    final total = plannerState.totalWeeklyTasks;
    final done = plannerState.completedWeeklyTasks;
    final progress = plannerState.weeklyProgress;

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
        border: Border(
          bottom: BorderSide(
            color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
            width: 1,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Week Controls Row
          Row(
            children: [
              IconButton.filledTonal(
                icon: const Icon(Icons.chevron_left, size: 20),
                onPressed: () => notifier.changeWeek(-1),
                style: IconButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: const Size(36, 36),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  weekRangeText,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.2,
                  ),
                ),
              ),
              TextButton.icon(
                onPressed: () => notifier.selectToday(),
                icon: const Icon(Icons.today_rounded, size: 16),
                label: const Text('Today', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                style: TextButton.styleFrom(
                  visualDensity: VisualDensity.compact,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                ),
              ),
              const SizedBox(width: 4),
              IconButton.filledTonal(
                icon: const Icon(Icons.chevron_right, size: 20),
                onPressed: () => notifier.changeWeek(1),
                style: IconButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: const Size(36, 36),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Progress Bar & Counter
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Weekly Completion',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                ),
              ),
              Text(
                '$done / $total done (${(progress * 100).toInt()}%)',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: TweenAnimationBuilder<double>(
              tween: Tween<double>(begin: 0, end: progress),
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeOutCubic,
              builder: (context, value, _) {
                return LinearProgressIndicator(
                  value: value,
                  minHeight: 6,
                  backgroundColor: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    progress >= 1.0 ? AppColors.success : AppColors.primary,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
