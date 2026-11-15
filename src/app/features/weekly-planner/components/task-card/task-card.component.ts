import { Component, Input, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../../core/models/task.model';
import { Priority, PRIORITY_METADATA } from '../../../../core/models/priority.enum';
import { CategoryItem } from '../../../../core/models/category.model';
import { WeeklyWorkStore } from '../../../../core/store';
import { DurationFormatPipe } from '../../../../shared/pipes/duration-format.pipe';
import { DateUtilsService } from '../../../../core/services/date-utils.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, DurationFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="task-card group relative bg-white dark:bg-[#131622] hover:bg-slate-50/90 dark:hover:bg-[#181c2c] border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 rounded-xl p-3 shadow-xs hover:shadow-md transition-all duration-150 select-none overflow-hidden"
      [class.opacity-60]="task.status === 'COMPLETED'"
    >
      <!-- Priority Left Edge Bar -->
      <div
        class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-colors"
        [style.backgroundColor]="priorityMeta.color"
      ></div>

      <div class="pl-2">
        <!-- Top Row: Checkbox, Title, and Context Menu Trigger -->
        <div class="flex items-start gap-2.5">
          
          <!-- Custom Animated Checkbox -->
          <button
            type="button"
            (click)="onToggle($event)"
            class="shrink-0 mt-0.5 w-4.5 h-4.5 rounded border transition-all duration-150 flex items-center justify-center cursor-pointer focus:outline-none"
            [ngClass]="task.status === 'COMPLETED'
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-2xs'
              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-transparent'"
            [attr.aria-label]="task.status === 'COMPLETED' ? 'Mark incomplete' : 'Mark complete'"
          >
            @if (task.status === 'COMPLETED') {
              <svg class="w-3 h-3 animate-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            }
          </button>

          <!-- Title and Description -->
          <div class="flex-1 min-w-0" (click)="onCardClick($event)">
            <p
              class="text-xs font-medium text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 transition-all break-words"
              [class.line-through]="task.status === 'COMPLETED'"
              [class.text-slate-400]="task.status === 'COMPLETED'"
              [class.dark:text-slate-500]="task.status === 'COMPLETED'"
            >
              {{ task.title }}
            </p>

            @if (task.description) {
              <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-normal break-words">
                {{ task.description }}
              </p>
            }
          </div>

          <!-- Quick More Actions Button -->
          <div class="relative shrink-0">
            <button
              type="button"
              (click)="toggleMenu($event)"
              class="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all focus:opacity-100 cursor-pointer"
              title="More actions"
              aria-label="Task options"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            <!-- Context Dropdown Menu -->
            @if (isMenuOpen) {
              <div
                class="absolute right-0 top-7 w-48 max-w-[85vw] bg-white dark:bg-[#1a1e2d] border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-xl py-1.5 z-40"
                (click)="$event.stopPropagation()"
              >
                <button
                  type="button"
                  (click)="onEdit()"
                  class="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2 cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit details
                </button>

                <button
                  type="button"
                  (click)="onMoveToToday()"
                  class="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2 cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                  Move to Today
                </button>

                <button
                  type="button"
                  (click)="onMoveToTomorrow()"
                  class="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2 cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  Move to Tomorrow
                </button>

                <!-- Mobile & Quick Reschedule Sub-options -->
                <div class="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Reschedule Day
                </div>
                <div class="px-2 py-1 grid grid-cols-4 gap-1">
                  @for (d of weekDays; track d.date) {
                    <button
                      type="button"
                      [disabled]="d.date === task.date"
                      (click)="onMoveToDay(d.date)"
                      class="px-1.5 py-1 text-[10px] font-bold rounded text-center transition-colors cursor-pointer"
                      [ngClass]="d.date === task.date
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 text-slate-700 dark:text-slate-300'"
                    >
                      {{ d.shortDayName }}
                    </button>
                  }
                </div>

                <button
                  type="button"
                  (click)="onDuplicate()"
                  class="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2 cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Duplicate
                </button>

                <div class="my-1 border-t border-slate-100 dark:border-slate-800"></div>

                <button
                  type="button"
                  (click)="onDelete()"
                  class="w-full text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete task
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Bottom Metadata Row: Dynamic Category Tag, Time Estimate, Tags -->
        <div class="flex items-center flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-slate-100/80 dark:border-slate-800/60">
          
          <!-- Dynamic Category Tag -->
          <span
            class="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border transition-colors shrink-0"
            [style.borderColor]="categoryItem.color + '40'"
            [style.backgroundColor]="categoryItem.color + '15'"
            [style.color]="categoryItem.color"
          >
            <span class="w-1.5 h-1.5 rounded-full" [style.backgroundColor]="categoryItem.color"></span>
            {{ categoryItem.name }}
          </span>

          <!-- Time Estimate Pill -->
          @if (task.estimatedMinutes) {
            <span class="inline-flex items-center gap-1 text-[10px] font-mono text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
              <svg class="w-2.5 h-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ task.estimatedMinutes | durationFormat }}
            </span>
          }

          <!-- First Tag if present -->
          @if (task.tags && task.tags.length > 0) {
            <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[100px]">
              #{{ task.tags[0] }}
            </span>
          }
        </div>
      </div>
    </div>
  `
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;

  private readonly store = inject(WeeklyWorkStore);
  private readonly dateUtils = inject(DateUtilsService);

  isMenuOpen = false;

  get weekDays() {
    return this.store.weekSchedule().days;
  }

  get priorityMeta() {
    return PRIORITY_METADATA[this.task.priority] || PRIORITY_METADATA[Priority.MEDIUM];
  }

  get categoryItem(): CategoryItem {
    return this.store.getCategoryById(this.task.categoryId);
  }

  onToggle(event: MouseEvent): void {
    event.stopPropagation();
    this.store.toggleTaskCompletion(this.task.id);
  }

  onCardClick(event: MouseEvent): void {
    event.stopPropagation();
    this.store.openEditModal(this.task);
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  onEdit(): void {
    this.isMenuOpen = false;
    this.store.openEditModal(this.task);
  }

  onMoveToToday(): void {
    this.isMenuOpen = false;
    const today = this.dateUtils.formatDateToISO(new Date());
    this.store.moveTaskToDay(this.task.id, today);
  }

  onMoveToTomorrow(): void {
    this.isMenuOpen = false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.store.moveTaskToDay(this.task.id, this.dateUtils.formatDateToISO(tomorrow));
  }

  onMoveToDay(dateKey: string): void {
    this.isMenuOpen = false;
    this.store.moveTaskToDay(this.task.id, dateKey);
  }

  onDuplicate(): void {
    this.isMenuOpen = false;
    this.store.createTask({
      title: `${this.task.title} (Copy)`,
      description: this.task.description,
      date: this.task.date,
      priority: this.task.priority,
      categoryId: this.task.categoryId,
      category: this.task.category,
      estimatedMinutes: this.task.estimatedMinutes,
      tags: this.task.tags
    });
  }

  onDelete(): void {
    this.isMenuOpen = false;
    this.store.deleteTask(this.task.id);
  }
}
