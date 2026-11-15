import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  ReorderTaskDto,
  WeekSchedule,
  DaySchedule,
  FilterState,
  INITIAL_FILTER_STATE,
  CategoryItem,
  DEFAULT_CATEGORIES,
  UNCATEGORIZED_CATEGORY
} from '../models';
import { STORAGE_KEYS } from '../constants/storage-keys.constant';
import { TaskRepository } from '../repositories/task-repository.interface';
import { DateUtilsService } from '../services/date-utils.service';
import { ToastService } from '../services/toast.service';
import confetti from 'canvas-confetti';

@Injectable({
  providedIn: 'root'
})
export class WeeklyWorkStore {
  private readonly repository = inject(TaskRepository);
  private readonly dateUtils = inject(DateUtilsService);
  private readonly toast = inject(ToastService);

  // Raw State Signals
  readonly tasks = signal<Task[]>([]);
  readonly categories = signal<CategoryItem[]>(this.loadStoredCategories());
  readonly currentDate = signal<Date>(new Date());
  readonly filters = signal<FilterState>(INITIAL_FILTER_STATE);
  readonly selectedTaskId = signal<string | null>(null);
  readonly isFormModalOpen = signal<boolean>(false);
  readonly isCategoryManagerOpen = signal<boolean>(false);
  readonly editingTask = signal<Task | null>(null);
  readonly modalPreselectedDate = signal<string | null>(null);
  readonly activeMobileDay = signal<string>(this.dateUtils.formatDateToISO(new Date()));
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

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
    this.loadCategories();
    this.loadWeekTasks();
  }

  // Load categories from LocalStorage or seed defaults
  private loadStoredCategories(): CategoryItem[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [...DEFAULT_CATEGORIES];
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If stored categories have obsolete 'cat-work' style IDs, discard and load defaults/backend
          if (parsed.some((c: CategoryItem) => c.id === 'cat-work' || c.id?.startsWith('cat-'))) {
            localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
            return [...DEFAULT_CATEGORIES];
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored categories', e);
    }
    return [...DEFAULT_CATEGORIES];
  }

  loadCategories(): void {
    if (this.repository.getCategories) {
      this.repository.getCategories().subscribe({
        next: (cats) => {
          if (cats && cats.length > 0) {
            this.categories.set(cats);
            this.saveCategories(cats);
          }
        },
        error: (err) => console.warn('Could not load categories from backend', err)
      });
    }
  }

  private saveCategories(categories: CategoryItem[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    }
  }

  getCategoryById(categoryId?: string | null): CategoryItem {
    if (!categoryId) return UNCATEGORIZED_CATEGORY;
    const found = this.categories().find(c => c.id === categoryId);
    return found || UNCATEGORIZED_CATEGORY;
  }

  addCategory(name: string, color: string): void {
    const trimmed = name.trim();
    if (this.repository.createCategory) {
      this.repository.createCategory({ name: trimmed, color }).subscribe({
        next: (created) => {
          this.categories.update(current => {
            const updated = [...current, created];
            this.saveCategories(updated);
            return updated;
          });
          this.toast.success('Category created', `"${trimmed}" is now available.`);
        },
        error: (err) => {
          const msg = err?.error?.message || err?.message || 'Could not create category';
          this.toast.error('Category creation failed', msg);
        }
      });
    }
  }

  updateCategory(id: string, name: string, color: string): void {
    const trimmed = name.trim();
    if (this.repository.updateCategory) {
      this.repository.updateCategory(id, { name: trimmed, color }).subscribe({
        next: (updatedCat) => {
          this.categories.update(current => {
            const updated = current.map(c => c.id === id ? updatedCat : c);
            this.saveCategories(updated);
            return updated;
          });
          this.toast.info('Category updated', `"${trimmed}" saved.`);
        },
        error: (err) => {
          const msg = err?.error?.message || err?.message || 'Could not update category';
          this.toast.error('Category update failed', msg);
        }
      });
    }
  }

  deleteCategory(id: string): void {
    const category = this.categories().find(c => c.id === id);
    if (!category) return;

    if (this.repository.deleteCategory) {
      this.repository.deleteCategory(id).subscribe({
        next: () => {
          this.categories.update(current => {
            const updated = current.filter(c => c.id !== id);
            this.saveCategories(updated);
            return updated;
          });
          this.loadWeekTasks();
          this.toast.warning('Category deleted', `"${category.name}" removed.`);
        },
        error: (err) => {
          const msg = err?.error?.message || err?.message || 'Could not delete category';
          this.toast.error('Category deletion failed', msg);
        }
      });
    }
  }

  openCategoryManager(): void {
    this.isCategoryManagerOpen.set(true);
  }

  closeCategoryManager(): void {
    this.isCategoryManagerOpen.set(false);
  }

  // Load tasks from backend for current week
  loadWeekTasks(startDate?: string, endDate?: string): void {
    const start = startDate || this.dateUtils.formatDateToISO(this.monday());
    const end = endDate || this.dateUtils.formatDateToISO(this.sunday());
    this.isLoading.set(true);
    this.error.set(null);

    this.repository.getTasks(start, end).subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.isLoading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        const message = err?.error?.message || err?.message || 'Could not connect to ASP.NET Core backend API at http://localhost:8080/api/v1';
        this.error.set(message);
        this.isLoading.set(false);
        this.toast.error('Backend Unreachable', message);
      }
    });
  }

  navigateWeek(direction: 'prev' | 'next' | 'today'): void {
    const current = new Date(this.currentDate());
    if (direction === 'today') {
      const today = new Date();
      this.currentDate.set(today);
      this.activeMobileDay.set(this.dateUtils.formatDateToISO(today));
      this.loadWeekTasks();
      return;
    }

    const delta = direction === 'next' ? 7 : -7;
    current.setDate(current.getDate() + delta);
    this.currentDate.set(current);
    
    const weekMon = this.dateUtils.getMondayOfWeek(current);
    this.activeMobileDay.set(this.dateUtils.formatDateToISO(weekMon));
    this.loadWeekTasks();
  }

  jumpToDate(date: Date): void {
    this.currentDate.set(new Date(date));
    this.activeMobileDay.set(this.dateUtils.formatDateToISO(date));
    this.loadWeekTasks();
  }

  setActiveMobileDay(dateStr: string): void {
    this.activeMobileDay.set(dateStr);
  }

  createTask(dto: CreateTaskDto): void {
    this.isLoading.set(true);
    const dayTasks = this.tasks().filter(t => t.date === dto.date);
    const highestOrder = dayTasks.reduce((max, t) => Math.max(max, t.order ?? 0), -1);

    const categoryId = dto.categoryId || this.categories()[0]?.id || '6af93b61992b2b1b5e5310e9';
    const categoryName = this.getCategoryById(categoryId).name;

    const payload: CreateTaskDto = {
      ...dto,
      categoryId,
      category: categoryName,
      order: dto.order ?? (highestOrder + 1)
    };

    this.repository.createTask(payload).subscribe({
      next: (created) => {
        this.tasks.update(tasks => [created, ...tasks]);
        this.closeModal();
        this.isLoading.set(false);
        this.toast.success('Task created', `"${created.title}" added for ${created.date}`);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.error?.message || err?.message || 'Failed to create task on server';
        this.toast.error('Create Failed', msg);
      }
    });
  }

  updateTask(id: string, updates: UpdateTaskDto): void {
    this.isLoading.set(true);
    const currentTask = this.tasks().find(t => t.id === id);
    const categoryName = updates.categoryId 
      ? this.getCategoryById(updates.categoryId).name 
      : (updates.category ?? currentTask?.category);

    const payload: UpdateTaskDto = {
      ...(currentTask ? {
        title: currentTask.title,
        description: currentTask.description,
        date: currentTask.date,
        dateKey: currentTask.dateKey,
        priority: currentTask.priority,
        categoryId: currentTask.categoryId,
        status: currentTask.status,
        estimatedMinutes: currentTask.estimatedMinutes,
        order: currentTask.order
      } : {}),
      ...updates,
      category: categoryName
    };

    this.repository.updateTask(id, payload).subscribe({
      next: (updated) => {
        this.tasks.update(tasks => tasks.map(t => t.id === id ? updated : t));
        this.closeModal();
        this.isLoading.set(false);
        this.toast.info('Task updated', `"${updated.title}" saved`);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.error?.message || err?.message || 'Failed to update task on server';
        this.toast.error('Update Failed', msg);
      }
    });
  }

  toggleTaskCompletion(id: string): void {
    const currentTask = this.tasks().find(t => t.id === id);
    if (!currentTask) return;

    const nextStatus = currentTask.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    const newlyCompleted = nextStatus === 'COMPLETED';
    const completedAt = newlyCompleted ? new Date().toISOString() : undefined;

    // Optimistic UI update
    this.tasks.update(tasks => tasks.map(t => t.id === id ? { ...t, status: nextStatus, completedAt } : t));

    this.repository.updateTask(id, {
      ...currentTask,
      status: nextStatus,
      completedAt
    }).subscribe({
      next: (saved) => {
        this.tasks.update(tasks => tasks.map(t => t.id === id ? saved : t));
        if (newlyCompleted) {
          this.toast.success('Task completed! 🎉', saved.title);
          const stats = this.weeklyStats();
          if (stats.allDone) {
            this.triggerCelebration();
          }
        }
      },
      error: (err) => {
        this.tasks.update(tasks => tasks.map(t => t.id === id ? currentTask : t));
        this.toast.error('Status Update Failed', err?.error?.message || 'Could not persist status');
      }
    });
  }

  deleteTask(id: string): void {
    const taskToDelete = this.tasks().find(t => t.id === id);
    if (!taskToDelete) return;

    this.tasks.update(tasks => tasks.filter(t => t.id !== id));

    this.repository.deleteTask(id).subscribe({
      next: () => {
        this.toast.warning('Task deleted', `"${taskToDelete.title}" removed`, {
          label: 'Undo',
          run: () => {
            this.createTask({
              title: taskToDelete.title,
              description: taskToDelete.description,
              date: taskToDelete.date,
              priority: taskToDelete.priority,
              categoryId: taskToDelete.categoryId,
              category: taskToDelete.category,
              status: taskToDelete.status,
              estimatedMinutes: taskToDelete.estimatedMinutes,
              tags: taskToDelete.tags
            });
          }
        });
      },
      error: (err) => {
        this.tasks.update(tasks => [taskToDelete, ...tasks]);
        this.toast.error('Delete Failed', err?.error?.message || 'Could not delete task from server');
      }
    });
  }

  reorderTask(taskId: string, targetDate: string, newIndex: number): void {
    const allTasks = this.tasks();
    const taskIndex = allTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const task = allTasks[taskIndex];
    const otherTasks = allTasks.filter(t => t.id !== taskId);

    const targetDayTasks = otherTasks
      .filter(t => t.date === targetDate)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const updatedTask: Task = {
      ...task,
      date: targetDate,
      dateKey: targetDate,
      updatedAt: new Date().toISOString()
    };

    targetDayTasks.splice(newIndex, 0, updatedTask);
    targetDayTasks.forEach((t, idx) => {
      t.order = idx;
    });

    const rest = otherTasks.filter(t => t.date !== targetDate);
    const newTasks = [...rest, ...targetDayTasks];
    this.tasks.set(newTasks);

    const reorderDtos: ReorderTaskDto[] = targetDayTasks.map(t => ({
      id: t.id,
      date: t.date,
      dateKey: t.date,
      order: t.order
    }));

    this.repository.reorderTasks(reorderDtos).subscribe({
      next: (res) => {
        if (Array.isArray(res) && res.length > 0) {
          const resMap = new Map(res.map(r => [r.id, r]));
          this.tasks.update(current => current.map(c => resMap.get(c.id) || c));
        }
      },
      error: (err) => {
        this.toast.error('Reorder Sync Failed', err?.error?.message || 'Server error syncing drag-and-drop');
      }
    });
  }

  moveTaskToDay(taskId: string, targetDate: string): void {
    this.updateTask(taskId, { date: targetDate, dateKey: targetDate });
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
    const candidateIds = candidates.map(c => c.id);
    const startIso = this.dateUtils.formatDateToISO(this.monday());
    const endIso = this.dateUtils.formatDateToISO(this.sunday());

    this.isLoading.set(true);
    this.repository.carryOverTasks({
      startDate: startIso,
      endDate: endIso,
      targetDate: todayIso,
      taskIds: candidateIds
    }).subscribe({
      next: (rolledOver) => {
        if (rolledOver.length > 0) {
          const rolledMap = new Map(rolledOver.map(r => [r.id, r]));
          this.tasks.update(current => current.map(c => rolledMap.get(c.id) || c));
        } else {
          const idSet = new Set(candidateIds);
          this.tasks.update(current => current.map(t => idSet.has(t.id) ? { ...t, date: todayIso, dateKey: todayIso } : t));
        }
        this.isLoading.set(false);
        this.toast.success(
          'Tasks rolled over',
          `Moved ${candidates.length} incomplete ${candidates.length === 1 ? 'task' : 'tasks'} to Today (${todayIso})`
        );
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toast.error('Carry Over Failed', err?.error?.message || 'Server error carrying over tasks');
      }
    });
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
    this.isLoading.set(true);
    this.repository.importTasks(imported).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toast.success('Tasks imported', `Loaded ${res.length || imported.length} tasks successfully.`);
        this.loadWeekTasks();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toast.error('Import Failed', err?.error?.message || 'Server error importing tasks');
      }
    });
  }

  private triggerCelebration(): void {
    if (typeof document === 'undefined') return;
    try {
      const testCanvas = document.createElement('canvas');
      if (!testCanvas.getContext || !testCanvas.getContext('2d')) {
        return; // Avoid jsdom missing canvas 2d context errors
      }
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

      // Dynamic Category Filter by categoryId
      if (filters.categories.length > 0 && !filters.categories.includes(t.categoryId)) {
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
