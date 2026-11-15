import { Priority } from './priority.enum';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date format YYYY-MM-DD
  dateKey?: string; // ASP.NET Core 8 Web API field compatibility
  priority: Priority;
  categoryId: string; // Dynamic user-managed category ID
  category?: string; // Fallback string for backend compatibility
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
  categoryId: string;
  category?: string;
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
  categoryId?: string;
  category?: string;
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
