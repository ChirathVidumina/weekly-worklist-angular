import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';
import { Priority } from '../models/priority.enum';

export interface ExportData {
  version: string;
  exportedAt: string;
  source: string;
  tasksCount: number;
  tasks: Task[];
}

@Injectable({
  providedIn: 'root'
})
export class ExportImportService {
  private readonly SCHEMA_VERSION = '1.0.0';

  exportToJson(tasks: Task[], filenamePrefix = 'cadence-weekly-tasks'): void {
    const data: ExportData = {
      version: this.SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      source: 'Cadence Weekly Work Planner',
      tasksCount: tasks.length,
      tasks
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filenamePrefix}-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  exportToCsv(tasks: Task[], filenamePrefix = 'cadence-tasks'): void {
    const headers = ['ID', 'Title', 'Date', 'Priority', 'CategoryID', 'Category', 'Status', 'EstimatedMinutes', 'Tags', 'Description'];
    const rows = tasks.map(t => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.date,
      t.priority,
      t.categoryId,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.status,
      t.estimatedMinutes,
      `"${(t.tags || []).join(';')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filenamePrefix}-${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  parseAndValidateJson(content: string): Task[] {
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error('Invalid JSON format. Please upload a valid JSON file.');
    }

    let rawTasks: any[] = [];
    if (Array.isArray(parsed)) {
      rawTasks = parsed;
    } else if (parsed && Array.isArray(parsed.tasks)) {
      rawTasks = parsed.tasks;
    } else {
      throw new Error('Unrecognized format: Expected a tasks array or Cadence export object.');
    }

    const validatedTasks: Task[] = [];
    const validPriorities = Object.values(Priority);

    for (let i = 0; i < rawTasks.length; i++) {
      const item = rawTasks[i];
      if (!item.title || typeof item.title !== 'string') {
        throw new Error(`Task #${i + 1} is missing a valid title.`);
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const date = item.date && dateRegex.test(item.date) ? item.date : new Date().toISOString().split('T')[0];

      const priority = validPriorities.includes(item.priority) ? item.priority : Priority.MEDIUM;
      const categoryId = item.categoryId || (item.category ? `cat-${item.category.toLowerCase()}` : 'cat-work');
      const category = item.category || 'Work';
      const status = item.status === 'COMPLETED' || item.status === 'IN_PROGRESS' || item.status === 'TODO'
        ? item.status
        : 'TODO';

      validatedTasks.push({
        id: item.id || `tsk-${Date.now()}-${i}`,
        title: item.title.trim(),
        description: item.description?.trim() || '',
        date,
        dateKey: item.dateKey || date,
        priority,
        categoryId,
        category,
        status,
        estimatedMinutes: Number(item.estimatedMinutes) || 30,
        order: Number(item.order) ?? i,
        tags: Array.isArray(item.tags) ? item.tags : [],
        completedAt: item.completedAt,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return validatedTasks;
  }
}
