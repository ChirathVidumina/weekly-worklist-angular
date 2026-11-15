import { Component, inject, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeeklyWorkStore } from '../../../../core/store';
import { ProgressRingComponent } from '../../../../shared/ui/progress-ring/progress-ring.component';

@Component({
  selector: 'app-week-navigator',
  standalone: true,
  imports: [CommonModule, ProgressRingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-3 sm:py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-[#0e1017]/40">
      <div class="max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        
        <!-- Left: Week Navigation Controls & Label -->
        <div class="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3">
          <!-- Prev / Today / Next Button Group -->
          <div class="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs shrink-0">
            <button
              type="button"
              (click)="store.navigateWeek('prev')"
              class="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 rounded-md transition-all cursor-pointer focus:outline-none"
              title="Previous week (Left Arrow)"
              aria-label="Previous week"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              (click)="store.navigateWeek('today')"
              class="px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer focus:outline-none"
              [ngClass]="store.isCurrentWeek() ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
              title="Jump to current week (Press 'T')"
            >
              Today
            </button>

            <button
              type="button"
              (click)="store.navigateWeek('next')"
              class="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 rounded-md transition-all cursor-pointer focus:outline-none"
              title="Next week (Right Arrow)"
              aria-label="Next week"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Date Label & Week Badge -->
          <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <h2 class="text-sm sm:text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
              {{ store.weekLabel() }}
            </h2>
            <span class="text-[10px] sm:text-xs font-mono font-medium px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 shrink-0">
              W{{ store.unfilteredWeekSchedule().weekNumber }}
            </span>
          </div>
        </div>

        <!-- Right: Progress Stats & Velocity Bar -->
        <div class="flex items-center gap-3 sm:gap-6 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/50 dark:border-slate-800/50">
          
          <!-- Hours & Tasks Breakdown -->
          <div class="flex items-center gap-4 text-xs">
            <!-- Tasks completed count -->
            <div>
              <span class="text-slate-400 dark:text-slate-500 block text-[11px] font-medium">Tasks</span>
              <span class="font-semibold text-slate-800 dark:text-slate-200">
                {{ stats().completedTasks }}<span class="text-slate-400 font-normal"> / {{ stats().totalTasks }}</span>
              </span>
            </div>

            <div class="w-px h-7 bg-slate-200 dark:bg-slate-800"></div>

            <!-- Hours planned vs completed -->
            <div>
              <span class="text-slate-400 dark:text-slate-500 block text-[11px] font-medium">Effort</span>
              <span class="font-semibold text-slate-800 dark:text-slate-200">
                {{ stats().completedHours }}h<span class="text-slate-400 font-normal"> / {{ stats().totalHours }}h</span>
              </span>
            </div>
          </div>

          <!-- Progress Ring & Percentage -->
          <div class="flex items-center gap-2.5 pl-2">
            <app-progress-ring
              [percentage]="stats().completionRate"
              [size]="38"
              [strokeWidth]="3.5"
              trackColor="rgba(148, 163, 184, 0.2)"
              [indicatorColor]="stats().completionRate === 100 ? '#10b981' : '#6366f1'"
              [showText]="false"
            />
            <div class="flex flex-col">
              <span class="text-xs font-bold" [ngClass]="stats().completionRate === 100 ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'">
                {{ stats().completionRate }}%
              </span>
              <span class="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none">
                Completed
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  `
})
export class WeekNavigatorComponent {
  readonly store = inject(WeeklyWorkStore);

  get stats() {
    return this.store.weeklyStats;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const tag = (event.target as HTMLElement)?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.store.navigateWeek('prev');
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.store.navigateWeek('next');
    }
  }
}
