import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeeklyWorkStore } from '../../../../core/store';
import { PlannerHeaderComponent } from '../../components/planner-header/planner-header.component';
import { WeekNavigatorComponent } from '../../components/week-navigator/week-navigator.component';
import { FilterToolbarComponent } from '../../components/filter-toolbar/filter-toolbar.component';
import { DesktopWeekBoardComponent } from '../../components/desktop-week-board/desktop-week-board.component';
import { MobileDayViewComponent } from '../../components/mobile-day-view/mobile-day-view.component';
import { TaskFormModalComponent } from '../../components/task-form-modal/task-form-modal.component';
import { ToastContainerComponent } from '../../../../shared/ui/toast-container/toast-container.component';

@Component({
  selector: 'app-planner-page',
  standalone: true,
  imports: [
    CommonModule,
    PlannerHeaderComponent,
    WeekNavigatorComponent,
    FilterToolbarComponent,
    DesktopWeekBoardComponent,
    MobileDayViewComponent,
    TaskFormModalComponent,
    ToastContainerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex flex-col bg-slate-50/50 dark:bg-[#090a0f] text-slate-900 dark:text-slate-100 selection:bg-indigo-500/20">
      
      <!-- Sticky Navigation Header -->
      <app-planner-header />

      <!-- Week Range & Progress Velocity Navigator -->
      <app-week-navigator />

      <!-- Filter & Status Toolbar -->
      <app-filter-toolbar />

      <!-- Main Content Area -->
      <main class="flex-1 max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 flex flex-col">
        
        <!-- Desktop 7-Day Kanban Board (md: and up) -->
        <div class="hidden md:block flex-1">
          <app-desktop-week-board />
        </div>

        <!-- Mobile Single-Day View (< md:) -->
        <div class="block md:hidden flex-1">
          <app-mobile-day-view />
        </div>

      </main>

      <!-- Keyboard Shortcuts Minimalist Status Bar -->
      <footer class="border-t border-slate-200/50 dark:border-slate-800/50 py-2 px-4 text-center text-[11px] text-slate-400 dark:text-slate-500 hidden sm:flex items-center justify-between max-w-[1720px] mx-auto w-full">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1 font-mono">
            <kbd class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">C</kbd> New Task
          </span>
          <span class="flex items-center gap-1 font-mono">
            <kbd class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">T</kbd> Jump to Today
          </span>
          <span class="flex items-center gap-1 font-mono">
            <kbd class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">← / →</kbd> Navigate Weeks
          </span>
          <span class="flex items-center gap-1 font-mono">
            <kbd class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">⌘K</kbd> Search
          </span>
        </div>
        <div class="flex items-center gap-1.5 font-medium">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Cadence Live Sync Active</span>
        </div>
      </footer>

      <!-- Task Form Modal (Create / Edit) -->
      <app-task-form-modal />

      <!-- Toast Notifications Container -->
      <app-toast-container />

    </div>
  `
})
export class PlannerPageComponent {
  readonly store = inject(WeeklyWorkStore);
}
