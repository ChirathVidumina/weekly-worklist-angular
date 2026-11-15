import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../providers/planner_provider.dart';
import '../../providers/theme_provider.dart';
import '../widgets/category_manager_sheet.dart';
import '../widgets/day_pill_selector.dart';
import '../widgets/task_card_tile.dart';
import '../widgets/task_editor_sheet.dart';
import '../widgets/week_switcher_header.dart';

class PlannerHomeScreen extends ConsumerStatefulWidget {
  const PlannerHomeScreen({super.key});

  @override
  ConsumerState<PlannerHomeScreen> createState() => _PlannerHomeScreenState();
}

class _PlannerHomeScreenState extends ConsumerState<PlannerHomeScreen> {
  final TextEditingController _searchController = TextEditingController();
  bool _showSearch = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _handleCarryOver() async {
    final notifier = ref.read(plannerProvider.notifier);
    final count = await notifier.carryOverUnfinishedTasks();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            count > 0
                ? 'Successfully carried over $count unfinished task(s) to next week!'
                : 'No overdue unfinished tasks to carry over.',
          ),
          backgroundColor: count > 0 ? AppColors.success : null,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final plannerState = ref.watch(plannerProvider);
    final notifier = ref.read(plannerProvider.notifier);
    final currentTheme = ref.watch(themeProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final filteredTasks = plannerState.filteredTasksForSelectedDay;

    // Show error snackbar if error occurred
    ref.listen<PlannerState>(plannerProvider, (previous, next) {
      if (next.errorMessage != null && next.errorMessage != previous?.errorMessage) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.errorMessage!),
            backgroundColor: AppColors.error,
            action: SnackBarAction(
              label: 'Dismiss',
              textColor: Colors.white,
              onPressed: () => notifier.clearErrorMessage(),
            ),
          ),
        );
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: _showSearch
            ? TextField(
                controller: _searchController,
                autofocus: true,
                decoration: const InputDecoration(
                  hintText: 'Search tasks or categories...',
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  contentPadding: EdgeInsets.zero,
                ),
                style: const TextStyle(fontSize: 16),
                onChanged: (val) => notifier.setSearchQuery(val),
              )
            : Row(
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.check_rounded, color: Colors.white, size: 18),
                  ),
                  const SizedBox(width: 10),
                  const Text('Weekly Worklist'),
                ],
              ),
        actions: [
          // Search Toggle
          IconButton(
            icon: Icon(_showSearch ? Icons.close : Icons.search_rounded),
            onPressed: () {
              setState(() {
                _showSearch = !_showSearch;
                if (!_showSearch) {
                  _searchController.clear();
                  notifier.setSearchQuery('');
                }
              });
            },
          ),

          // Theme Toggle
          IconButton(
            icon: Icon(
              currentTheme == ThemeMode.dark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
            ),
            tooltip: 'Toggle Dark/Light Mode',
            onPressed: () => ref.read(themeProvider.notifier).toggleTheme(),
          ),

          // More Actions Popup (Carry Over, Categories, Refresh)
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert_rounded),
            onSelected: (val) {
              if (val == 'categories') {
                CategoryManagerSheet.show(context);
              } else if (val == 'carry_over') {
                _handleCarryOver();
              } else if (val == 'refresh') {
                notifier.loadInitialData();
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'categories',
                child: Row(
                  children: [
                    Icon(Icons.category_outlined, size: 18),
                    SizedBox(width: 10),
                    Text('Manage Categories'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'carry_over',
                child: Row(
                  children: [
                    Icon(Icons.forward_rounded, size: 18),
                    SizedBox(width: 10),
                    Text('Carry Over Overdue'),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem(
                value: 'refresh',
                child: Row(
                  children: [
                    Icon(Icons.refresh_rounded, size: 18),
                    SizedBox(width: 10),
                    Text('Sync with Cloud'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => notifier.loadInitialData(),
        child: Column(
          children: [
            // Week Switcher Header with Progress Bar
            const WeekSwitcherHeader(),

            // Mon–Sun Pill Selector
            const DayPillSelector(),

            // Filter Strip (Priority & Category)
            _buildFilterStrip(context, ref),

            // Task List View or Empty State
            Expanded(
              child: plannerState.isLoading && plannerState.tasks.isEmpty
                  ? const Center(
                      child: CircularProgressIndicator(),
                    )
                  : filteredTasks.isEmpty
                      ? _buildEmptyState(context, isDark)
                      : ListView.builder(
                          padding: const EdgeInsets.only(top: 8, bottom: 80),
                          itemCount: filteredTasks.length,
                          itemBuilder: (context, index) {
                            final task = filteredTasks[index];
                            return TaskCardTile(
                              key: ValueKey(task.id),
                              task: task,
                              onEdit: () {
                                TaskEditorSheet.show(
                                  context,
                                  task: task,
                                  defaultDateKey: plannerState.selectedDateKey,
                                );
                              },
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          TaskEditorSheet.show(
            context,
            defaultDateKey: plannerState.selectedDateKey,
          );
        },
        icon: const Icon(Icons.add_rounded),
        label: const Text('Add Task', style: TextStyle(fontWeight: FontWeight.w600)),
      ),
    );
  }

  Widget _buildFilterStrip(BuildContext context, WidgetRef ref) {
    final plannerState = ref.watch(plannerProvider);
    final notifier = ref.read(plannerProvider.notifier);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final priorities = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];

    return Container(
      height: 44,
      padding: const EdgeInsets.symmetric(vertical: 6),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface.withOpacity(0.5) : AppColors.lightSurface,
        border: Border(
          bottom: BorderSide(
            color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
            width: 0.5,
          ),
        ),
      ),
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          // Priority Chips
          ...priorities.map((p) {
            final isSelected = (plannerState.priorityFilter == null && p == 'ALL') ||
                (plannerState.priorityFilter == p);

            return Padding(
              padding: const EdgeInsets.only(right: 6),
              child: FilterChip(
                label: Text(
                  p,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  ),
                ),
                selected: isSelected,
                visualDensity: VisualDensity.compact,
                padding: const EdgeInsets.symmetric(horizontal: 4),
                onSelected: (_) => notifier.setPriorityFilter(p),
              ),
            );
          }),

          const VerticalDivider(width: 16, indent: 4, endIndent: 4),

          // All Categories Option
          Padding(
            padding: const EdgeInsets.only(right: 6),
            child: FilterChip(
              label: const Text('All Categories', style: TextStyle(fontSize: 11)),
              selected: plannerState.categoryFilter == null,
              visualDensity: VisualDensity.compact,
              padding: const EdgeInsets.symmetric(horizontal: 4),
              onSelected: (_) => notifier.setCategoryFilter(null),
            ),
          ),

          // Dynamic Category Chips
          ...plannerState.categories.map((cat) {
            final isSelected = plannerState.categoryFilter == cat.id;
            final catColor = AppColors.parseHex(cat.color);

            return Padding(
              padding: const EdgeInsets.only(right: 6),
              child: FilterChip(
                avatar: Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(color: catColor, shape: BoxShape.circle),
                ),
                label: Text(cat.name, style: const TextStyle(fontSize: 11)),
                selected: isSelected,
                visualDensity: VisualDensity.compact,
                padding: const EdgeInsets.symmetric(horizontal: 4),
                onSelected: (_) => notifier.setCategoryFilter(isSelected ? null : cat.id),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, bool isDark) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: (isDark ? AppColors.darkBorder : const Color(0xFFF1F5F9)),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.check_circle_outline_rounded,
                size: 38,
                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'No tasks for this day',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Enjoy your open schedule or tap "+ Add Task" below to plan new priorities.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
