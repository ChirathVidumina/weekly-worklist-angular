import { Component, inject, ChangeDetectionStrategy, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { WeeklyWorkStore } from '../../../../core/store';
import { TaskCardComponent } from '../task-card/task-card.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { DurationFormatPipe } from '../../../../shared/pipes/duration-format.pipe';

@Component({
  selector: 'app-mobile-day-view',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskCardComponent, EmptyStateComponent, ButtonComponent, DurationFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full w-full max-w-full">
      
      <!-- Sticky Day-Tab Bar with Auto-Centering -->
      <div class="sticky top-14 sm:top-16 z-20 bg-white/95 dark:bg-[#0c0e14]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 py-2 px-3 overflow-x-auto no-scrollbar">
        <div class="flex items-center gap-2 min-w-max">
          @for (day of schedule().days; track day.date) {
            <button
              type="button"
              [attr.data-tab-date]="day.date"
              (click)="store.setActiveMobileDay(day.date)"
              class="flex flex-col items-center justify-center py-2 px-3 rounded-xl border transition-all cursor-pointer relative min-w-[52px] min-h-[48px] select-none"
              [ngClass]="isSelected(day.date)
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md font-bold'
                : 'bg-slate-100/80 dark:bg-[#131622] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'"
            >
              <span class="text-[10px] font-semibold uppercase tracking-wider">
                {{ day.shortDayName }}
              </span>
              <span class="text-sm font-bold mt-0.5">
                {{ day.dayNumber }}
              </span>

              <!-- Today Dot -->
              @if (day.isToday) {
                <span
                  class="w-1.5 h-1.5 rounded-full absolute bottom-1"
                  [ngClass]="isSelected(day.date) ? 'bg-indigo-400' : 'bg-indigo-600 dark:bg-indigo-400'"
                ></span>
              }

              <!-- Remaining tasks badge if any -->
              @if (day.totalTasks - day.completedTasks > 0) {
                <span
                  class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs"
                  [ngClass]="isSelected(day.date) ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'"
                >
                  {{ day.totalTasks - day.completedTasks }}
                </span>
              }
            </button>
          }
        </div>
      </div>

      <!-- Active Day Feed Header & Tasks -->
      @if (activeDay(); as current) {
        <div class="p-3 sm:p-4 flex-1">
          <!-- Day Summary Bar -->
          <div class="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-200/60 dark:border-slate-800/60">
            <div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 sm:gap-2">
                {{ current.dayName }}, {{ current.monthName }} {{ current.dayNumber }}
                @if (current.isToday) {
                  <span class="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500 text-white">
                    Today
                  </span>
                }
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {{ current.completedTasks }} of {{ current.totalTasks }} completed
                @if (current.totalEstimatedMinutes > 0) {
                  • {{ current.totalEstimatedMinutes | durationFormat }} planned
                }
              </p>
            </div>

            <app-button variant="primary" size="xs" (clicked)="onAddForDay(current.date)">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add</span>
            </app-button>
          </div>

          <!-- Tasks List with CDK Drop & pb-28 so FAB never obscures bottom cards -->
          <div
            cdkDropList
            [id]="'mobile-list-' + current.date"
            [cdkDropListData]="current.tasks"
            (cdkDropListDropped)="onDrop($event, current.date)"
            class="space-y-3 min-h-[220px] pb-28"
          >
            @if (store.isLoading() && current.tasks.length === 0) {
              <div class="space-y-2.5 animate-pulse pt-2">
                <div class="h-20 bg-slate-200/60 dark:bg-slate-800/40 rounded-xl"></div>
                <div class="h-16 bg-slate-200/40 dark:bg-slate-800/20 rounded-xl"></div>
              </div>
            } @else {
              @for (task of current.tasks; track task.id) {
                <div cdkDrag [cdkDragData]="task">
                  <div *cdkDragPlaceholder class="cdk-drag-placeholder"></div>
                  <app-task-card [task]="task" />
                </div>
              } @empty {
                <app-empty-state
                  title="No tasks scheduled"
                  [message]="'You have no tasks lined up for ' + current.dayName + '. Tap below to add your first item.'"
                  icon="calendar"
                  actionLabel="Schedule Task"
                  (action)="onAddForDay(current.date)"
                />
              }
            }
          </div>
        </div>
      }

      <!-- Floating Action Button (FAB) for Mobile View -->
      <button
        type="button"
        (click)="onAddForDay(store.activeMobileDay())"
        class="fixed bottom-6 right-5 z-40 w-14 h-14 rounded-full shadow-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-500/30 md:hidden pb-safe"
        aria-label="Add task"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </button>

    </div>
  `
})
export class MobileDayViewComponent {
  readonly store = inject(WeeklyWorkStore);

  readonly schedule = this.store.weekSchedule;

  readonly activeDay = computed(() => {
    const selectedDate = this.store.activeMobileDay();
    const days = this.schedule().days;
    return days.find(d => d.date === selectedDate) || days[0];
  });

  constructor() {
    effect(() => {
      const active = this.store.activeMobileDay();
      if (typeof document !== 'undefined') {
        setTimeout(() => {
          const btn = document.querySelector(`[data-tab-date="${active}"]`) as HTMLElement;
          btn?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }, 50);
      }
    });
  }

  isSelected(date: string): boolean {
    return this.store.activeMobileDay() === date;
  }

  onAddForDay(date: string): void {
    this.store.openCreateModal(date);
  }

  onDrop(event: CdkDragDrop<any>, date: string): void {
    if (event.previousIndex !== event.currentIndex) {
      const task = event.container.data[event.previousIndex];
      this.store.reorderTask(task.id, date, event.currentIndex);
    }
  }
}
