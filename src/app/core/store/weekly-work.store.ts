import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Task, CreateTaskDto, UpdateTaskDto, WeekSchedule, DaySchedule, FilterState, INITIAL_FILTER_STATE, Priority } from '../models';
import { LocalStorageTaskRepository } from '../repositories/local-storage-task.repository';
import { DateUtilsService } from '../services/date-utils.service';
import { ToastService } from '../services/toast.service';
import confetti from 'canvas-confetti';

@Injectable({
  providedIn: 'root'
})
export class WeeklyWorkStore {
  private readonly repository = inject(LocalStorageTaskRepository);
  private readonly dateUtils = inject(DateUtilsService);
  private readonly toast = inject(ToastService);

  // Raw State Signals
  readonly tasks = signal<Task[]>([]);
  readonly currentDate = signal<Date>(new Date(2026, 10, 15)); // Nov 15, 2026
  readonly filters = signal<FilterState>(INITIAL_FILTER_STATE);
  readonly selectedTaskId = signal<string | null>(null);
  readonly isFormModalOpen = signal<boolean>(false);
  readonly editingTask = signal<Task | null>(null);
  readonly modalPreselectedDate = signal<string | null>(null);
  readonly activeMobileDay = signal<string>('2026-11-15');
  readonly isLoading = signal<boolean>(false);

  // Computed: Week Boundary
  readonly monday = computed(() => this.dateUtils.getMondayOfWeek(this.currentDate()));
  readonly sunday = computed(() => this.dateUtils.getSundayOfWeek(this.currentDate()));

  readonly weekLabel = computed(() => {
    return this.dateUtils.formatWeekLabel(this.monday(), this.sunday());
  });

  readonly isCurrentWeek = computed(() => {
    const today = new Date();
    const todayMon = this.dateUtils.getMondayOfWeek(today);
    return this.dateUtils.formatDateToISO(todayMon) === this.dateUtils.formatDateToISO(this.monday());
  });

  // Computed: Schedule calculation without filters
  readonly unfilteredWeekSchedule = computed<WeekSchedule>(() => {
    return this.buildWeekSchedule(this.tasks(), this.currentDate());
  });

  // Computed: Schedule calculation with active filters applied
  readonly weekSchedule = computed<WeekSchedule>(() => {
    const allTasks = this.tasks();
    const currentFilters = this.filters();
    const filteredTasks = this.applyFilters(allTasks, currentFilters);
    return this.buildWeekSchedule(filteredTasks, this.currentDate());
  });

  // Computed: Weekly Stats
  readonly weeklyStats = computed(() => {
    const schedule = this.unfilteredWeekSchedule();
    const totalHours = Math.round((schedule.totalEstimatedMinutes / 60) * 10) / 10;
    const completedHours = Math.round((schedule.completedEstimatedMinutes / 60) * 10) / 10;
    const remainingHours = Math.max(0, Math.round((totalHours - completedHours) * 10) / 10);

    return {
      totalTasks: schedule.totalTasks,
      completedTasks: schedule.completedTasks,
      completionRate: schedule.completionRate,
      totalHours,
      completedHours,
      remainingHours,
      allDone: schedule.totalTasks > 0 && schedule.completedTasks === schedule.totalTasks
    };
  });

  // Computed: Unfinished tasks before today in the current week
  readonly carryOverTasks = computed<Task[]>(() => {
    const todayIso = this.dateUtils.formatDateToISO(new Date());
    const weekDates = this.dateUtils.getWeekDates(this.currentDate()).map(d => this.dateUtils.formatDateToISO(d));
    const allTasks = this.tasks();

    return allTasks.filter(t => {
      return weekDates.includes(t.date) && t.date < todayIso && t.status !== 'COMPLETED';
    });
  });

  // Computed: Active Filter Count
  readonly activeFilterCount = computed(() => {
    const f = this.filters();
    let count = 0;
    if (f.searchQuery.trim().length > 0) count++;
    if (f.status !== 'ALL') count++;
    if (f.priorities.length > 0) count += f.priorities.length;
    if (f.categories.length > 0) count += f.categories.length;
    return count;
  });

  // Computed: Available unique tags for autocompletion
  readonly availableTags = computed<string[]>(() => {
    const tagsSet = new Set<string>();
    for (const t of this.tasks()) {
      if (t.tags) {
        for (const tag of t.tags) {
          tagsSet.add(tag);
        }
      }
    }
    return Array.from(tagsSet).sort();
  });

  constructor() {
    this.loadInitialTasks();

    // Auto-save effect
    effect(() => {
      const allTasks = this.tasks();
      if (allTasks.length > 0) {
        this.repository.saveTasks(allTasks).subscribe();
      }
    });
  }

  // Actions
  loadInitialTasks(): void {
    this.isLoading.set(true);
    this.repository.getTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load tasks', err);
        this.isLoading.set(false);
      }
    });
  }

  navigateWeek(direction: 'prev' | 'next' | 'today'): void {
    const current = new Date(this.currentDate());
    if (direction === 'today') {
      const today = new Date();
      this.currentDate.set(today);
      this.activeMobileDay.set(this.dateUtils.formatDateToISO(today));
      return;
    }

    const delta = direction === 'next' ? 7 : -7;
    current.setDate(current.getDate() + delta);
    this.currentDate.set(current);
    
    // Also align active mobile day to the first day of that week
    const weekMon = this.dateUtils.getMondayOfWeek(current);
    this.activeMobileDay.set(this.dateUtils.formatDateToISO(weekMon));
  }

  jumpToDate(date: Date): void {
    this.currentDate.set(new Date(date));
    this.activeMobileDay.set(this.dateUtils.formatDateToISO(date));
  }

  setActiveMobileDay(dateStr: string): void {
    this.activeMobileDay.set(dateStr);
  }

  createTask(dto: CreateTaskDto): void {
    const currentTasks = this.tasks();
    const dayTasks = currentTasks.filter(t => t.date === dto.date);
    const highestOrder = dayTasks.reduce((max, t) => Math.max(max, t.order ?? 0), -1);

    const newTask: Task = {
      id: `tsk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: dto.title.trim(),
      description: dto.description?.trim() || '',
      date: dto.date,
      priority: dto.priority,
      category: dto.category,
      status: dto.status ?? 'TODO',
      estimatedMinutes: dto.estimatedMinutes ?? 30,
      order: highestOrder + 1,
      tags: dto.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.tasks.update(tasks => [newTask, ...tasks]);
    this.closeModal();
    this.toast.success('Task created', `"${newTask.title}" added for ${newTask.date}`);
  }

  updateTask(id: string, updates: UpdateTaskDto): void {
    let updatedTitle = '';
    this.tasks.update(tasks => {
      return tasks.map(t => {
        if (t.id === id) {
          const completedAt = updates.status === 'COMPLETED' && t.status !== 'COMPLETED'
            ? new Date().toISOString()
            : updates.status && updates.status !== 'COMPLETED'
              ? undefined
              : t.completedAt;

          const updated: Task = {
            ...t,
            ...updates,
            completedAt,
            updatedAt: new Date().toISOString()
          };
          updatedTitle = updated.title;
          return updated;
        }
        return t;
      });
    });

    this.closeModal();
    this.toast.info('Task updated', updatedTitle ? `"${updatedTitle}" saved` : undefined);
  }

  toggleTaskCompletion(id: string): void {
    let newlyCompleted = false;
    let taskTitle = '';

    this.tasks.update(tasks => {
      return tasks.map(t => {
        if (t.id === id) {
          const nextStatus = t.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
          newlyCompleted = nextStatus === 'COMPLETED';
          taskTitle = t.title;
          return {
            ...t,
            status: nextStatus,
            completedAt: newlyCompleted ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      });
    });

    if (newlyCompleted) {
      this.toast.success('Task completed! 🎉', taskTitle);
      
      // Check if all weekly tasks are now done for grand celebration
      const stats = this.weeklyStats();
      if (stats.allDone) {
        this.triggerCelebration();
      }
    }
  }

  deleteTask(id: string): void {
    const taskToDelete = this.tasks().find(t => t.id === id);
    if (!taskToDelete) return;

    this.tasks.update(tasks => tasks.filter(t => t.id !== id));

    // Offer undo action in toast
    this.toast.warning('Task deleted', `"${taskToDelete.title}" removed`, {
      label: 'Undo',
      run: () => {
        this.tasks.update(tasks => [taskToDelete, ...tasks]);
        this.toast.info('Restored task', `"${taskToDelete.title}" restored`);
      }
    });
  }

  reorderTask(taskId: string, targetDate: string, newIndex: number): void {
    this.tasks.update(allTasks => {
      const taskIndex = allTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return allTasks;

      const task = allTasks[taskIndex];
      const otherTasks = allTasks.filter(t => t.id !== taskId);

      // Extract existing tasks for target date
      const targetDayTasks = otherTasks
        .filter(t => t.date === targetDate)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      const updatedTask: Task = {
        ...task,
        date: targetDate,
        updatedAt: new Date().toISOString()
      };

      // Insert at newIndex
      targetDayTasks.splice(newIndex, 0, updatedTask);

      // Re-assign order
      targetDayTasks.forEach((t, idx) => {
        t.order = idx;
      });

      const rest = otherTasks.filter(t => t.date !== targetDate);
      return [...rest, ...targetDayTasks];
    });
  }

  moveTaskToDay(taskId: string, targetDate: string): void {
    this.tasks.update(tasks => {
      return tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            date: targetDate,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      });
    });

    const targetDayName = this.dateUtils.getDayName(this.dateUtils.parseISODate(targetDate));
    this.toast.info('Task moved', `Scheduled for ${targetDayName} (${targetDate})`);
  }

  carryOverUnfinishedTasks(): void {
    const candidates = this.carryOverTasks();
    if (candidates.length === 0) {
      this.toast.info('No overdue tasks', 'All past tasks for this week are completed.');
      return;
    }

    const todayIso = this.dateUtils.formatDateToISO(new Date());
    const candidateIds = new Set(candidates.map(c => c.id));

    this.tasks.update(tasks => {
      return tasks.map(t => {
        if (candidateIds.has(t.id)) {
          return {
            ...t,
            date: todayIso,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      });
    });

    this.toast.success(
      'Tasks rolled over',
      `Moved ${candidates.length} incomplete ${candidates.length === 1 ? 'task' : 'tasks'} to Today (${todayIso})`
    );
  }

  setFilters(partial: Partial<FilterState>): void {
    this.filters.update(f => ({ ...f, ...partial }));
  }

  resetFilters(): void {
    this.filters.set(INITIAL_FILTER_STATE);
  }

  openCreateModal(dateStr?: string): void {
    const targetDate = dateStr || this.dateUtils.formatDateToISO(new Date());
    this.modalPreselectedDate.set(targetDate);
    this.editingTask.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(task: Task): void {
    this.editingTask.set(task);
    this.modalPreselectedDate.set(task.date);
    this.isFormModalOpen.set(true);
  }

  closeModal(): void {
    this.isFormModalOpen.set(false);
    this.editingTask.set(null);
    this.modalPreselectedDate.set(null);
  }

  importTasks(imported: Task[]): void {
    this.tasks.set(imported);
    this.toast.success('Tasks imported', `Loaded ${imported.length} tasks successfully.`);
  }

  resetToSample(): void {
    this.repository.resetToSampleData().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.toast.success('Sample Data Loaded', 'Restored default sprint workload.');
      }
    });
  }

  private triggerCelebration(): void {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore if canvas is not accessible
    }
  }

  private applyFilters(tasks: Task[], filters: FilterState): Task[] {
    const query = filters.searchQuery.trim().toLowerCase();

    return tasks.filter(t => {
      // Search
      if (query) {
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query) ?? false;
        const matchesTag = t.tags?.some(tag => tag.toLowerCase().includes(query)) ?? false;
        if (!matchesTitle && !matchesDesc && !matchesTag) return false;
      }

      // Status
      if (filters.status === 'ACTIVE' && t.status === 'COMPLETED') return false;
      if (filters.status === 'COMPLETED' && t.status !== 'COMPLETED') return false;

      // Priority
      if (filters.priorities.length > 0 && !filters.priorities.includes(t.priority)) {
        return false;
      }

      // Category
      if (filters.categories.length > 0 && !filters.categories.includes(t.category)) {
        return false;
      }

      return true;
    });
  }

  private buildWeekSchedule(tasks: Task[], refDate: Date): WeekSchedule {
    const monday = this.dateUtils.getMondayOfWeek(refDate);
    const sunday = this.dateUtils.getSundayOfWeek(refDate);
    const weekDates = this.dateUtils.getWeekDates(refDate);

    let totalTasks = 0;
    let completedTasks = 0;
    let totalEstimatedMinutes = 0;
    let completedEstimatedMinutes = 0;

    const days: DaySchedule[] = weekDates.map(date => {
      const dateIso = this.dateUtils.formatDateToISO(date);
      const dayTasks = tasks
        .filter(t => t.date === dateIso)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      const dayTotalTasks = dayTasks.length;
      const dayCompletedTasks = dayTasks.filter(t => t.status === 'COMPLETED').length;
      const dayTotalMinutes = dayTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
      const dayCompletedMinutes = dayTasks
        .filter(t => t.status === 'COMPLETED')
        .reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
      const dayCompletionRate = dayTotalTasks > 0 ? Math.round((dayCompletedTasks / dayTotalTasks) * 100) : 0;

      totalTasks += dayTotalTasks;
      completedTasks += dayCompletedTasks;
      totalEstimatedMinutes += dayTotalMinutes;
      completedEstimatedMinutes += dayCompletedMinutes;

      return {
        date: dateIso,
        dayName: this.dateUtils.getDayName(date),
        shortDayName: this.dateUtils.getShortDayName(date),
        dayNumber: date.getDate(),
        monthName: this.dateUtils.getMonthName(date),
        isToday: this.dateUtils.isToday(dateIso),
        isPast: this.dateUtils.isPast(dateIso),
        isWeekend: this.dateUtils.isWeekend(date),
        tasks: dayTasks,
        totalTasks: dayTotalTasks,
        completedTasks: dayCompletedTasks,
        totalEstimatedMinutes: dayTotalMinutes,
        completedEstimatedMinutes: dayCompletedMinutes,
        completionRate: dayCompletionRate
      };
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      weekStartDate: this.dateUtils.formatDateToISO(monday),
      weekEndDate: this.dateUtils.formatDateToISO(sunday),
      weekLabel: this.dateUtils.formatWeekLabel(monday, sunday),
      weekNumber: this.dateUtils.getWeekNumber(refDate),
      year: refDate.getFullYear(),
      days,
      totalTasks,
      completedTasks,
      completionRate,
      totalEstimatedMinutes,
      completedEstimatedMinutes
    };
  }
}
