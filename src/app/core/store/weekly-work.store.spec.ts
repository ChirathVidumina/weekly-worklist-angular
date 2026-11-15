import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { WeeklyWorkStore } from './weekly-work.store';
import { TaskRepository } from '../repositories/task-repository.interface';
import { Priority } from '../models/priority.enum';
import { Category } from '../models/category.enum';
import { Task, CreateTaskDto, UpdateTaskDto } from '../models/task.model';

describe('WeeklyWorkStore (with Spring Boot REST API)', () => {
  let store: WeeklyWorkStore;
  let mockRepo: any;

  const sampleBackendTask: Task = {
    id: 'tsk-101',
    title: 'Review Backend PR',
    date: '2026-11-15',
    dateKey: '2026-11-15',
    priority: Priority.HIGH,
    category: Category.ENGINEERING,
    status: 'TODO',
    estimatedMinutes: 45,
    order: 0,
    createdAt: '2026-11-15T00:00:00Z',
    updatedAt: '2026-11-15T00:00:00Z'
  };

  beforeEach(() => {
    mockRepo = {
      getTasks: vi.fn().mockReturnValue(of([sampleBackendTask])),
      createTask: vi.fn().mockImplementation((dto: CreateTaskDto) => of({
        id: 'tsk-102',
        title: dto.title,
        date: dto.date,
        dateKey: dto.dateKey || dto.date,
        priority: dto.priority,
        category: dto.category,
        status: dto.status || 'TODO',
        estimatedMinutes: dto.estimatedMinutes || 30,
        order: dto.order ?? 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      updateTask: vi.fn().mockImplementation((id: string, updates: UpdateTaskDto) => of({
        ...sampleBackendTask,
        ...updates,
        id
      })),
      deleteTask: vi.fn().mockReturnValue(of(void 0)),
      reorderTasks: vi.fn().mockReturnValue(of(void 0)),
      carryOverTasks: vi.fn().mockReturnValue(of([])),
      importTasks: vi.fn().mockReturnValue(of([]))
    };

    TestBed.configureTestingModule({
      providers: [
        WeeklyWorkStore,
        { provide: TaskRepository, useValue: mockRepo }
      ]
    });

    store = TestBed.inject(WeeklyWorkStore);
  });

  it('should initialize and fetch tasks from Spring Boot repository', () => {
    expect(store).toBeTruthy();
    expect(mockRepo.getTasks).toHaveBeenCalled();
    expect(store.tasks().length).toBe(1);
    expect(store.tasks()[0].title).toBe('Review Backend PR');
    expect(store.error()).toBeNull();
  });

  it('should compute weekly schedule and stats reactively', () => {
    const schedule = store.weekSchedule();
    expect(schedule.days.length).toBe(7);

    const stats = store.weeklyStats();
    expect(stats.totalTasks).toBe(1);
    expect(stats.completedTasks).toBe(0);
    expect(stats.completionRate).toBe(0);
  });

  it('should toggle task completion and call repository.updateTask', () => {
    store.toggleTaskCompletion('tsk-101');
    expect(mockRepo.updateTask).toHaveBeenCalledWith(
      'tsk-101',
      expect.objectContaining({ status: 'COMPLETED' })
    );
  });

  it('should create new tasks via repository.createTask', () => {
    store.createTask({
      title: 'New API endpoint',
      date: '2026-11-15',
      priority: Priority.URGENT,
      category: Category.ENGINEERING,
      estimatedMinutes: 60
    });

    expect(mockRepo.createTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New API endpoint' })
    );
    expect(store.tasks().length).toBe(2);
  });

  it('should handle repository network errors gracefully', () => {
    mockRepo.getTasks.mockReturnValue(throwError(() => new Error('Connection refused: localhost:8080')));
    store.loadWeekTasks();

    expect(store.error()).toContain('Connection refused');
    expect(store.isLoading()).toBe(false);
  });
});
