import { Priority } from './priority.enum';
import { Category } from './category.enum';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date format YYYY-MM-DD
  dateKey?: string; // Spring Boot backend field compatibility
  priority: Priority;
  category: Category;
  status: TaskStatus;
  estimatedMinutes: number;
  order: number;
  tags?: string[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  date: string;
  dateKey?: string;
  priority: Priority;
  category: Category;
  status?: TaskStatus;
  estimatedMinutes?: number;
  order?: number;
  tags?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  date?: string;
  dateKey?: string;
  priority?: Priority;
  category?: Category;
  status?: TaskStatus;
  estimatedMinutes?: number;
  order?: number;
  tags?: string[];
  completedAt?: string;
}

export interface ReorderTaskDto {
  id: string;
  date: string;
  dateKey?: string;
  order: number;
}

export interface CarryOverRequestDto {
  startDate?: string;
  endDate?: string;
  targetDate: string;
  taskIds?: string[];
}
