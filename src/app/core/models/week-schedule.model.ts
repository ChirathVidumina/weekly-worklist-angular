import { Task } from './task.model';

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  dayName: string; // 'Monday', 'Tuesday', ...
  shortDayName: string; // 'Mon', 'Tue', ...
  dayNumber: number; // 1..31
  monthName: string; // 'Nov'
  isToday: boolean;
  isPast: boolean;
  isWeekend: boolean;
  tasks: Task[];
  totalTasks: number;
  completedTasks: number;
  totalEstimatedMinutes: number;
  completedEstimatedMinutes: number;
  completionRate: number; // 0..100
}

export interface WeekSchedule {
  weekStartDate: string; // YYYY-MM-DD (Monday)
  weekEndDate: string; // YYYY-MM-DD (Sunday)
  weekLabel: string; // e.g. "Nov 9 – Nov 15, 2026"
  weekNumber: number;
  year: number;
  days: DaySchedule[];
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalEstimatedMinutes: number;
  completedEstimatedMinutes: number;
}
