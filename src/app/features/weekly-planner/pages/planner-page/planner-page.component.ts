import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeeklyWorkStore } from '../../../../core/store';
import { PlannerHeaderComponent } from '../../components/planner-header/planner-header.component';
import { WeekNavigatorComponent } from '../../components/week-navigator/week-navigator.component';
import { FilterToolbarComponent } from '../../components/filter-toolbar/filter-toolbar.component';
import { DesktopWeekBoardComponent } from '../../components/desktop-week-board/desktop-week-board.component';
import { MobileDayViewComponent } from '../../components/mobile-day-view/mobile-day-view.component';
import { TaskFormModalComponent } from '../../components/task-form-modal/task-form-modal.component';
import { CategoryManagerModalComponent } from '../../components/category-manager-modal/category-manager-modal.component';
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
    CategoryManagerModalComponent,
    ToastContainerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden bg-slate-50/50 dark:bg-[#090a0f] text-slate-900 dark:text-slate-100 selection:bg-indigo-500/20">
      
      <!-- Sticky Navigation Header -->
      <app-planner-header />

      <!-- Week Range & Progress Velocity Navigator -->
      <app-week-navigator />

      <!-- Filter & Status Toolbar -->
      <app-filter-toolbar />

      <!-- Backend Connection Notice if offline -->
      @if (store.error(); as err) {
        <div class="bg-rose-500/10 border-b border-rose-500/20 px-3 sm:px-4 py-2.5 text-xs text-rose-600 dark:text-rose-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div class="flex items-center gap-2 max-w-4xl min-w-0">
            <svg class="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="truncate"><strong>Backend Server Offline:</strong> {{ err }}</span>
          </div>
          <button
            type="button"
            (click)="store.loadWeekTasks()"
            class="px-2.5 py-1 text-xs font-semibold rounded bg-rose-600 text-white hover:bg-rose-500 transition-colors cursor-pointer shrink-0 self-end sm:self-auto"
          >
            Retry Connection
          </button>
        </div>
      }

      <!-- Main Content Area -->
      <main class="flex-1 max-w-[1720px] w-full mx-auto px-2 sm:px-6 lg:px-8 py-3 flex flex-col">
        
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
          @if (store.error()) {
            <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>REST API Offline (http://localhost:8080)</span>
          } @else if (store.isLoading()) {
            <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span>Syncing REST API...</span>
          } @else {
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Spring Boot Connected (http://localhost:8080)</span>
          }
        </div>
      </footer>

      <!-- Task Form Modal (Create / Edit) -->
      <app-task-form-modal />

      <!-- Custom Category Manager Modal -->
      <app-category-manager-modal />

      <!-- Toast Notifications Container -->
      <app-toast-container />

    </div>
  `
})
export class PlannerPageComponent {
  readonly store = inject(WeeklyWorkStore);
}
