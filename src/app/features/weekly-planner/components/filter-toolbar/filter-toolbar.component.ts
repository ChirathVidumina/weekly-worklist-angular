import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeeklyWorkStore } from '../../../../core/store';
import { Priority, PRIORITY_METADATA } from '../../../../core/models/priority.enum';
import { Category, CATEGORY_METADATA } from '../../../../core/models/category.enum';
import { StatusFilter } from '../../../../core/models/filter-state.model';

@Component({
  selector: 'app-filter-toolbar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="py-2.5 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/20 dark:bg-[#0c0e14]/20 overflow-x-auto no-scrollbar">
      <div class="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 min-w-max">
        
        <!-- Left: Filters Group -->
        <div class="flex items-center gap-4">
          
          <!-- Status Segmented Control -->
          <div class="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              (click)="setStatus('ALL')"
              class="px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer focus:outline-none"
              [ngClass]="store.filters().status === 'ALL' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
            >
              All
            </button>
            <button
              type="button"
              (click)="setStatus('ACTIVE')"
              class="px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer focus:outline-none"
              [ngClass]="store.filters().status === 'ACTIVE' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
            >
              In Progress
            </button>
            <button
              type="button"
              (click)="setStatus('COMPLETED')"
              class="px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer focus:outline-none"
              [ngClass]="store.filters().status === 'COMPLETED' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
            >
              Completed
            </button>
          </div>

          <div class="w-px h-5 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

          <!-- Priority Pills -->
          <div class="flex items-center gap-1.5">
            <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline mr-1">
              Priority:
            </span>
            @for (p of priorities; track p.key) {
              <button
                type="button"
                (click)="togglePriority(p.key)"
                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border transition-all cursor-pointer focus:outline-none select-none"
                [ngClass]="isPrioritySelected(p.key)
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-xs'
                  : 'bg-white/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'"
              >
                <span class="w-1.5 h-1.5 rounded-full" [style.backgroundColor]="p.color"></span>
                <span>{{ p.label }}</span>
              </button>
            }
          </div>

          <div class="w-px h-5 bg-slate-200 dark:bg-slate-800 hidden md:block"></div>

          <!-- Category Pills -->
          <div class="hidden lg:flex items-center gap-1.5">
            <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500 mr-1">
              Category:
            </span>
            @for (cat of categories; track cat.key) {
              <button
                type="button"
                (click)="toggleCategory(cat.key)"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border transition-all cursor-pointer focus:outline-none select-none"
                [ngClass]="isCategorySelected(cat.key)
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'"
              >
                <span class="w-1.5 h-1.5 rounded-full" [style.backgroundColor]="cat.dotColor"></span>
                <span>{{ cat.label }}</span>
              </button>
            }
          </div>

        </div>

        <!-- Right: Active filters counter & Reset -->
        @if (store.activeFilterCount() > 0) {
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500 dark:text-slate-400">
              <strong class="text-indigo-600 dark:text-indigo-400">{{ store.activeFilterCount() }}</strong> filtered
            </span>
            <button
              type="button"
              (click)="store.resetFilters()"
              class="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 flex items-center gap-1 hover:underline cursor-pointer"
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

  readonly categories = Object.values(CATEGORY_METADATA);

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

  isCategorySelected(cat: Category): boolean {
    return this.store.filters().categories.includes(cat);
  }

  toggleCategory(cat: Category): void {
    const current = this.store.filters().categories;
    const next = current.includes(cat)
      ? current.filter(x => x !== cat)
      : [...current, cat];
    this.store.setFilters({ categories: next });
  }
}
