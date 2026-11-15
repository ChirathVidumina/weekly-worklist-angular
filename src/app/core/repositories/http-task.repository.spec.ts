import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpTaskRepository } from './http-task.repository';
import { environment } from '../../../environments/environment';
import { Priority } from '../models/priority.enum';
import { Category } from '../models/category.enum';

describe('HttpTaskRepository', () => {
  let repository: HttpTaskRepository;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/tasks`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpTaskRepository,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    repository = TestBed.inject(HttpTaskRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch tasks for a date range with query parameters', () => {
    const mockTasks = [
      { id: '1', title: 'Task 1', date: '2026-11-09', priority: 'HIGH', category: 'ENGINEERING', status: 'TODO' }
    ];

    repository.getTasks('2026-11-09', '2026-11-15').subscribe(tasks => {
      expect(tasks.length).toBe(1);
      expect(tasks[0].id).toBe('1');
      expect(tasks[0].title).toBe('Task 1');
    });

    const req = httpMock.expectOne(`${baseUrl}?startDate=2026-11-09&endDate=2026-11-15`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTasks);
  });

  it('should create a task via POST', () => {
    const dto = {
      title: 'New Sprint Task',
      date: '2026-11-15',
      priority: Priority.URGENT,
      category: Category.PRODUCT,
      estimatedMinutes: 30
    };

    repository.createTask(dto).subscribe(task => {
      expect(task.id).toBe('new-1');
      expect(task.title).toBe('New Sprint Task');
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.title).toBe('New Sprint Task');
    req.flush({ ...dto, id: 'new-1' });
  });

  it('should update a task via PUT', () => {
    const updates = { title: 'Updated Title', status: 'COMPLETED' as const };

    repository.updateTask('1', updates).subscribe(task => {
      expect(task.title).toBe('Updated Title');
      expect(task.status).toBe('COMPLETED');
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ id: '1', date: '2026-11-15', ...updates });
  });

  it('should batch reorder tasks via PATCH', () => {
    const items = [
      { id: '1', date: '2026-11-10', order: 0 },
      { id: '2', date: '2026-11-10', order: 1 }
    ];

    repository.reorderTasks(items).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/reorder`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.length).toBe(2);
    req.flush([]);
  });

  it('should delete a task via DELETE', () => {
    repository.deleteTask('1').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should carry over tasks via POST', () => {
    const reqDto = {
      startDate: '2026-11-09',
      endDate: '2026-11-15',
      targetDate: '2026-11-16'
    };

    repository.carryOverTasks(reqDto).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/carry-over`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.targetDate).toBe('2026-11-16');
    req.flush([]);
  });

  it('should bulk import tasks via POST', () => {
    const importList = [
      { id: '1', title: 'Task 1', date: '2026-11-15', priority: Priority.LOW, category: Category.PERSONAL, status: 'TODO' as const, estimatedMinutes: 15, order: 0, createdAt: '', updatedAt: '' }
    ];

    repository.importTasks(importList).subscribe(tasks => {
      expect(tasks.length).toBe(1);
    });

    const req = httpMock.expectOne(`${baseUrl}/import`);
    expect(req.request.method).toBe('POST');
    req.flush(importList);
  });
});
