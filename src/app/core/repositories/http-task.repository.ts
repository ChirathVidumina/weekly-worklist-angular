import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Task, CreateTaskDto, UpdateTaskDto, ReorderTaskDto, CarryOverRequestDto } from '../models/task.model';
import { TaskRepository } from './task-repository.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpTaskRepository implements TaskRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tasks`;

  getTasks(startDate?: string, endDate?: string): Observable<Task[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<any>(this.baseUrl, { params }).pipe(
      map(res => this.extractTaskList(res).map(this.normalizeTask))
    );
  }

  createTask(task: CreateTaskDto): Observable<Task> {
    const payload = {
      ...task,
      dateKey: task.dateKey || task.date
    };
    return this.http.post<any>(this.baseUrl, payload).pipe(
      map(this.normalizeTask)
    );
  }

  updateTask(id: string, updates: UpdateTaskDto): Observable<Task> {
    const payload = {
      ...updates,
      dateKey: updates.dateKey || updates.date
    };
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload).pipe(
      map(this.normalizeTask)
    );
  }

  reorderTasks(items: ReorderTaskDto[]): Observable<Task[] | void> {
    const payload = items.map(item => ({
      id: item.id,
      date: item.date,
      dateKey: item.dateKey || item.date,
      order: item.order
    }));

    return this.http.patch<any>(`${this.baseUrl}/reorder`, payload).pipe(
      map(res => {
        if (Array.isArray(res)) {
          return res.map(this.normalizeTask);
        }
        return void 0;
      })
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  carryOverTasks(request: CarryOverRequestDto): Observable<Task[]> {
    return this.http.post<any>(`${this.baseUrl}/carry-over`, request).pipe(
      map(res => this.extractTaskList(res).map(this.normalizeTask))
    );
  }

  importTasks(tasks: Task[]): Observable<Task[]> {
    const payload = tasks.map(t => ({
      ...t,
      dateKey: t.dateKey || t.date
    }));

    return this.http.post<any>(`${this.baseUrl}/import`, payload).pipe(
      map(res => this.extractTaskList(res).map(this.normalizeTask))
    );
  }

  private extractTaskList(res: any): any[] {
    if (Array.isArray(res)) {
      return res;
    }
    if (res && Array.isArray(res.tasks)) {
      return res.tasks;
    }
    if (res && Array.isArray(res.content)) {
      // Spring Data Page<Task> support
      return res.content;
    }
    if (res && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  }

  private normalizeTask(raw: any): Task {
    const date = raw.date || raw.dateKey || new Date().toISOString().split('T')[0];
    const categoryId = raw.categoryId || (raw.category ? `cat-${raw.category.toLowerCase()}` : 'cat-work');
    return {
      id: String(raw.id),
      title: raw.title || '',
      description: raw.description || '',
      date,
      dateKey: raw.dateKey || date,
      priority: raw.priority || 'MEDIUM',
      categoryId,
      category: raw.category || categoryId,
      status: raw.status || 'TODO',
      estimatedMinutes: Number(raw.estimatedMinutes) || 0,
      order: Number(raw.order) ?? 0,
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      completedAt: raw.completedAt,
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || new Date().toISOString()
    };
  }
}
