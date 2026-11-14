import { Component, Input, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { DaySchedule } from '../../../../core/models/week-schedule.model';
import { WeeklyWorkStore } from '../../../../core/store';
import { TaskCardComponent } from '../task-card/task-card.component';
import { DurationFormatPipe } from '../../../../shared/pipes/duration-format.pipe';

@Component({
  selector: 'app-day-column',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskCardComponent, DurationFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col h-full rounded-2xl bg-slate-100/50 dark:bg-[#10121a]/60 border border-slate-200/70 dark:border-slate-800/70 transition-colors"
      [class.ring-2]="day.isToday"
      [class.ring-indigo-500/40]="day.isToday"
      [class.border-indigo-500/30]="day.isToday"
    >
      <!-- Column Header -->
      <div class="p-3.5 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold tracking-tight text-slate-800 dark:text-slate-200">
                {{ day.shortDayName }}
              </span>
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {{ day.dayNumber }}
              </span>
              @if (day.isToday) {
                <span class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-indigo-500 text-white shadow-2xs">
                  Today
                </span>
              }
            </div>
            <div class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              {{ day.completedTasks }}/{{ day.totalTasks }} done
              @if (day.totalEstimatedMinutes > 0) {
                • {{ day.totalEstimatedMinutes | durationFormat }}
              }
            </div>
          </div>
        </div>

        <!-- Quick Add button for this day -->
        <button
          type="button"
          (click)="onQuickAdd()"
          class="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800/80 transition-colors cursor-pointer focus:outline-none"
          [title]="'Add task to ' + day.dayName"
          aria-label="Add task"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <!-- Task Drop List (CDK Drag & Drop) -->
      <div
        cdkDropList
        [id]="'day-list-' + day.date"
        [cdkDropListData]="day.tasks"
        [cdkDropListConnectedTo]="connectedDropLists"
        (cdkDropListDropped)="onDrop($event)"
        class="flex-1 p-2.5 space-y-2.5 overflow-y-auto min-h-[140px]"
      >
        @for (task of day.tasks; track task.id) {
          <div cdkDrag [cdkDragData]="task">
            <!-- Drop placeholder indicator -->
            <div *cdkDragPlaceholder class="cdk-drag-placeholder"></div>
            <app-task-card [task]="task" />
          </div>
        } @empty {
          <!-- Empty Day Placeholder -->
          <div
            (click)="onQuickAdd()"
            class="h-28 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:border-indigo-400/50 dark:hover:border-indigo-500/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all group"
          >
            <svg class="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
              No tasks
            </span>
            <span class="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5">
              Click to schedule
            </span>
          </div>
        }
      </div>
    </div>
  `
})
export class DayColumnComponent {
  @Input({ required: true }) day!: DaySchedule;
  @Input() connectedDropLists: string[] = [];

  private readonly store = inject(WeeklyWorkStore);

  onQuickAdd(): void {
    this.store.openCreateModal(this.day.date);
  }

  onDrop(event: CdkDragDrop<any>): void {
    if (event.previousContainer === event.container) {
      if (event.previousIndex !== event.currentIndex) {
        const task = event.container.data[event.previousIndex];
        this.store.reorderTask(task.id, this.day.date, event.currentIndex);
      }
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      this.store.reorderTask(task.id, this.day.date, event.currentIndex);
    }
  }
}
