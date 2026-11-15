import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Task, CreateTaskDto, UpdateTaskDto, ReorderTaskDto, CarryOverRequestDto } from '../models/task.model';
import { CategoryItem } from '../models/category.model';

export abstract class TaskRepository {
  abstract getTasks(startDate?: string, endDate?: string): Observable<Task[]>;
  abstract createTask(task: CreateTaskDto): Observable<Task>;
  abstract updateTask(id: string, updates: UpdateTaskDto): Observable<Task>;
  abstract reorderTasks(items: ReorderTaskDto[]): Observable<Task[] | void>;
  abstract deleteTask(id: string): Observable<void>;
  abstract carryOverTasks(request: CarryOverRequestDto): Observable<Task[]>;
  abstract importTasks(tasks: Task[]): Observable<Task[]>;
  abstract getCategories?(): Observable<CategoryItem[]>;
  abstract createCategory?(category: { name: string; color: string }): Observable<CategoryItem>;
  abstract updateCategory?(id: string, category: { name: string; color: string }): Observable<CategoryItem>;
  abstract deleteCategory?(id: string): Observable<void>;
}

export type ITaskRepository = TaskRepository;
export const TASK_REPOSITORY = new InjectionToken<TaskRepository>('TaskRepository');
