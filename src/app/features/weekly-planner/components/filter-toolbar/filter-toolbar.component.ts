import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeeklyWorkStore } from '../../../../core/store';
import { Priority, PRIORITY_METADATA } from '../../../../core/models/priority.enum';
import { StatusFilter } from '../../../../core/models/filter-state.model';

@Component({
  selector: 'app-filter-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="py-2 sm:py-2.5 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-[#0c0e14]/40">
      <div class="max-w-[1720px] mx-auto">
        
        <!-- Mobile Search Input (< md) -->
        <div class="px-3 sm:px-6 mb-2 md:hidden">
          <div class="relative w-full">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search tasks, descriptions, or tags..."
              [ngModel]="store.filters().searchQuery"
              (ngModelChange)="onSearchChange($event)"
              class="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
            />
            @if (store.filters().searchQuery) {
              <button
                type="button"
                (click)="onSearchChange('')"
                class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label="Clear search"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            }
          </div>
        </div>

        <!-- Filter Pills Scrollable Strip -->
        <div class="px-3 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar flex items-center justify-between gap-3 min-w-0">
          <div class="flex items-center gap-2.5 sm:gap-3 flex-nowrap shrink-0 py-0.5">
            
            <!-- Status Segmented Control -->
            <div class="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shrink-0">
              <button
                type="button"
                (click)="setStatus('ALL')"
                class="px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer focus:outline-none"
                [ngClass]="store.filters().status === 'ALL' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
              >
                All
              </button>
              <button
                type="button"
                (click)="setStatus('ACTIVE')"
                class="px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer focus:outline-none"
                [ngClass]="store.filters().status === 'ACTIVE' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
              >
                In Progress
              </button>
              <button
                type="button"
                (click)="setStatus('COMPLETED')"
                class="px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer focus:outline-none"
                [ngClass]="store.filters().status === 'COMPLETED' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
              >
                Completed
              </button>
            </div>

            <div class="w-px h-5 bg-slate-200 dark:bg-slate-800 shrink-0"></div>

            <!-- Priority Pills -->
            <div class="flex items-center gap-1.5 flex-nowrap shrink-0">
              <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline mr-0.5">
                Priority:
              </span>
              @for (p of priorities; track p.key) {
                <button
                  type="button"
                  (click)="togglePriority(p.key)"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer focus:outline-none select-none shrink-0"
                  [ngClass]="isPrioritySelected(p.key)
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-xs font-semibold'
                    : 'bg-white/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" [style.backgroundColor]="p.color"></span>
                  <span>{{ p.label }}</span>
                </button>
              }
            </div>

            <div class="w-px h-5 bg-slate-200 dark:bg-slate-800 shrink-0"></div>

            <!-- Dynamic Categories Pills (Horizontally Scrollable) -->
            <div class="flex items-center gap-1.5 flex-nowrap shrink-0">
              <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline mr-0.5">
                Category:
              </span>
              @for (cat of store.categories(); track cat.id) {
                <button
                  type="button"
                  (click)="toggleCategory(cat.id)"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer focus:outline-none select-none shrink-0"
                  [style.borderColor]="isCategorySelected(cat.id) ? cat.color : undefined"
                  [style.backgroundColor]="isCategorySelected(cat.id) ? (cat.color + '25') : undefined"
                  [style.color]="isCategorySelected(cat.id) ? cat.color : undefined"
                  [ngClass]="!isCategorySelected(cat.id) ? 'bg-white/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700' : 'shadow-2xs font-bold'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" [style.backgroundColor]="cat.color"></span>
                  <span>{{ cat.name }}</span>
                </button>
              }
              <button
                type="button"
                (click)="store.openCategoryManager()"
                class="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer shrink-0"
                title="Manage Categories"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Manage</span>
              </button>
            </div>

          </div>

          <!-- Active filters counter & Reset -->
          @if (store.activeFilterCount() > 0) {
            <div class="flex items-center gap-2 shrink-0 pl-2">
              <span class="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                <strong class="text-indigo-600 dark:text-indigo-400">{{ store.activeFilterCount() }}</strong> filtered
              </span>
              <button
                type="button"
                (click)="store.resetFilters()"
                class="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 flex items-center gap-1 hover:underline cursor-pointer whitespace-nowrap"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            </div>
          }

        </div>

      </div>
    </div>
  `
})
export class FilterToolbarComponent {
  readonly store = inject(WeeklyWorkStore);

  readonly priorities = [
    PRIORITY_METADATA[Priority.URGENT],
    PRIORITY_METADATA[Priority.HIGH],
    PRIORITY_METADATA[Priority.MEDIUM],
    PRIORITY_METADATA[Priority.LOW]
  ];

  onSearchChange(value: string): void {
    this.store.setFilters({ searchQuery: value });
  }

  setStatus(status: StatusFilter): void {
    this.store.setFilters({ status });
  }

  isPrioritySelected(p: Priority): boolean {
    return this.store.filters().priorities.includes(p);
  }

  togglePriority(p: Priority): void {
    const current = this.store.filters().priorities;
    const next = current.includes(p)
      ? current.filter(x => x !== p)
      : [...current, p];
    this.store.setFilters({ priorities: next });
  }

  isCategorySelected(catId: string): boolean {
    return this.store.filters().categories.includes(catId);
  }

  toggleCategory(catId: string): void {
    const current = this.store.filters().categories;
    const next = current.includes(catId)
      ? current.filter(x => x !== catId)
      : [...current, catId];
    this.store.setFilters({ categories: next });
  }
}
