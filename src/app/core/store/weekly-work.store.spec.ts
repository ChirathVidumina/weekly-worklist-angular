import { TestBed } from '@angular/core/testing';
import { WeeklyWorkStore } from './weekly-work.store';
import { Priority } from '../models/priority.enum';
import { Category } from '../models/category.enum';

describe('WeeklyWorkStore', () => {
  let store: WeeklyWorkStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(WeeklyWorkStore);
  });

  it('should be initialized with default tasks', () => {
    expect(store).toBeTruthy();
    expect(store.tasks().length).toBeGreaterThan(0);
  });

  it('should compute weekly schedule and stats', () => {
    const schedule = store.weekSchedule();
    expect(schedule.days.length).toBe(7);

    const stats = store.weeklyStats();
    expect(stats.totalTasks).toBeGreaterThan(0);
    expect(stats.totalHours).toBeGreaterThan(0);
  });

  it('should toggle task completion', () => {
    const task = store.tasks()[0];
    const initialStatus = task.status;

    store.toggleTaskCompletion(task.id);
    const updated = store.tasks().find(t => t.id === task.id);
    expect(updated?.status).not.toBe(initialStatus);
  });

  it('should create new tasks', () => {
    const initialCount = store.tasks().length;
    store.createTask({
      title: 'Test New Task',
      date: '2026-11-15',
      priority: Priority.HIGH,
      category: Category.ENGINEERING,
      estimatedMinutes: 60
    });

    expect(store.tasks().length).toBe(initialCount + 1);
    const created = store.tasks().find(t => t.title === 'Test New Task');
    expect(created).toBeTruthy();
    expect(created?.priority).toBe(Priority.HIGH);
  });

  it('should filter tasks by search query', () => {
    store.setFilters({ searchQuery: 'NonExistentTask123XYZ' });
    const schedule = store.weekSchedule();
    const totalFiltered = schedule.days.reduce((sum, d) => sum + d.tasks.length, 0);
    expect(totalFiltered).toBe(0);

    store.resetFilters();
    const restoredSchedule = store.weekSchedule();
    const restoredFiltered = restoredSchedule.days.reduce((sum, d) => sum + d.tasks.length, 0);
    expect(restoredFiltered).toBeGreaterThan(0);
  });
});
