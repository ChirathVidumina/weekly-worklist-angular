import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Task } from '../models/task.model';
import { ITaskRepository } from './task-repository.interface';
import { STORAGE_KEYS } from '../constants/storage-keys.constant';
import { SAMPLE_TASKS } from '../constants/default-tasks.constant';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageTaskRepository implements ITaskRepository {
  private memoryCache: Task[] | null = null;

  getTasks(): Observable<Task[]> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return of(this.memoryCache ?? [...SAMPLE_TASKS]);
      }

      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!stored) {
        this.saveToStorage(SAMPLE_TASKS);
        return of([...SAMPLE_TASKS]);
      }

      const parsed: Task[] = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveToStorage(SAMPLE_TASKS);
        return of([...SAMPLE_TASKS]);
      }

      this.memoryCache = parsed;
      return of(parsed);
    } catch (err) {
      console.warn('Failed to parse tasks from localStorage, fallback to sample data', err);
      return of([...SAMPLE_TASKS]);
    }
  }

  saveTasks(tasks: Task[]): Observable<void> {
    try {
      this.saveToStorage(tasks);
      return of(void 0);
    } catch (err) {
      return throwError(() => err);
    }
  }

  addTask(task: Task): Observable<Task> {
    try {
      const current = this.getCurrentTasksSync();
      const updated = [task, ...current];
      this.saveToStorage(updated);
      return of(task);
    } catch (err) {
      return throwError(() => err);
    }
  }

  updateTask(task: Task): Observable<Task> {
    try {
      const current = this.getCurrentTasksSync();
      const index = current.findIndex(t => t.id === task.id);
      if (index === -1) {
        return throwError(() => new Error(`Task with id ${task.id} not found`));
      }
      current[index] = { ...task, updatedAt: new Date().toISOString() };
      this.saveToStorage(current);
      return of(current[index]);
    } catch (err) {
      return throwError(() => err);
    }
  }

  deleteTask(id: string): Observable<void> {
    try {
      const current = this.getCurrentTasksSync();
      const filtered = current.filter(t => t.id !== id);
      this.saveToStorage(filtered);
      return of(void 0);
    } catch (err) {
      return throwError(() => err);
    }
  }

  resetToSampleData(): Observable<Task[]> {
    try {
      this.saveToStorage(SAMPLE_TASKS);
      return of([...SAMPLE_TASKS]);
    } catch (err) {
      return throwError(() => err);
    }
  }

  private getCurrentTasksSync(): Task[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return this.memoryCache ? [...this.memoryCache] : [...SAMPLE_TASKS];
    }
    const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!stored) return [...SAMPLE_TASKS];
    try {
      return JSON.parse(stored) as Task[];
    } catch {
      return [...SAMPLE_TASKS];
    }
  }

  private saveToStorage(tasks: Task[]): void {
    this.memoryCache = [...tasks];
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }
  }
}
