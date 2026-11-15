import { Component, inject, ChangeDetectionStrategy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeeklyWorkStore } from '../../../../core/store';
import { ThemeService } from '../../../../core/services/theme.service';
import { ExportImportService } from '../../../../core/services/export-import.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-planner-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0c0e14]/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div class="max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        <!-- Left: Logo & Brand -->
        <div class="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div class="w-7 h-7 sm:w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <svg class="w-4 h-4 sm:w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div class="flex items-center gap-1.5 sm:gap-2">
            <h1 class="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1 sm:gap-1.5">
              Cadence
              <span class="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 sm:py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                PRO
              </span>
              @if (store.isLoading()) {
                <span class="inline-flex items-center text-slate-400 dark:text-slate-500 animate-spin" title="Syncing with backend...">
                  <svg class="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              }
            </h1>
          </div>
        </div>

        <!-- Center: Search Bar with Cmd+K hint (Desktop & Tablet) -->
        <div class="flex-1 max-w-md hidden md:block">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              #searchInput
              type="text"
              placeholder="Search tasks, descriptions, or tags..."
              [ngModel]="store.filters().searchQuery"
              (ngModelChange)="onSearchChange($event)"
              class="w-full pl-9 pr-16 py-1.5 text-xs bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            <div class="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
              <kbd class="text-[10px] font-mono font-medium px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-400 dark:text-slate-500 shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        <!-- Right: Actions & Tools -->
        <div class="flex items-center gap-1.5 sm:gap-2.5">
          
          <!-- Desktop Secondary Actions: Carry Over, Data Menu, Category Manager -->
          <div class="hidden sm:flex items-center gap-2">
            <!-- Carry Over Unfinished Tasks Button -->
            @if (carryOverCount() > 0) {
              <button
                type="button"
                (click)="store.carryOverUnfinishedTasks()"
                class="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors shadow-2xs cursor-pointer active:scale-95"
                title="Roll forward incomplete past tasks to Today"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Carry Over</span>
                <span class="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {{ carryOverCount() }}
                </span>
              </button>
            }

            <!-- JSON Import/Export Dropdown -->
            <div class="relative">
              <button
                type="button"
                (click)="toggleDataMenu($event)"
                class="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
                title="Data Import / Export"
                aria-label="Data Import and Export"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </button>

              @if (isDataMenuOpen) {
                <div
                  class="absolute right-0 mt-1.5 w-48 bg-white dark:bg-[#161924] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-40"
                  (click)="isDataMenuOpen = false"
                >
                  <button
                    type="button"
                    (click)="exportJson()"
                    class="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center gap-2 cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Tasks (JSON)
                  </button>
                  <button
                    type="button"
                    (click)="exportCsv()"
                    class="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center gap-2 cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Tasks (CSV)
                  </button>
                  <button
                    type="button"
                    (click)="triggerFileInput()"
                    class="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center gap-2 cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Import Tasks (JSON)
                  </button>
                </div>
              }
            </div>

            <!-- Manage Categories Button -->
            <button
              type="button"
              (click)="store.openCategoryManager()"
              class="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              title="Manage Custom Categories"
              aria-label="Manage Categories"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </button>
          </div>

          <!-- Mobile Collapsed "More" (...) Menu Button (< sm) -->
          <div class="relative sm:hidden">
            <button
              type="button"
              (click)="toggleMobileMenu($event)"
              class="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              title="More options"
              aria-label="More options"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
              <!-- Carry Over Notification Dot on Mobile Menu -->
              @if (carryOverCount() > 0) {
                <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500"></span>
              }
            </button>

            <!-- Mobile Popover Menu -->
            @if (isMobileMenuOpen) {
              <div
                class="absolute right-0 mt-1.5 w-56 bg-white dark:bg-[#161924] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1.5 z-40"
                (click)="isMobileMenuOpen = false"
              >
                @if (carryOverCount() > 0) {
                  <button
                    type="button"
                    (click)="store.carryOverUnfinishedTasks()"
                    class="w-full text-left px-3.5 py-2 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center justify-between cursor-pointer"
                  >
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Carry Over Tasks</span>
                    </div>
                    <span class="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {{ carryOverCount() }}
                    </span>
                  </button>
                  <div class="my-1 border-t border-slate-100 dark:border-slate-800"></div>
                }

                <button
                  type="button"
                  (click)="store.openCategoryManager()"
                  class="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center gap-2 cursor-pointer"
                >
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Manage Categories
                </button>

                <div class="my-1 border-t border-slate-100 dark:border-slate-800"></div>

                <button
                  type="button"
                  (click)="exportJson()"
                  class="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center gap-2 cursor-pointer"
                >
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Tasks (JSON)
                </button>

                <button
                  type="button"
                  (click)="exportCsv()"
                  class="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center gap-2 cursor-pointer"
                >
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Tasks (CSV)
                </button>

                <button
                  type="button"
                  (click)="triggerFileInput()"
                  class="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center gap-2 cursor-pointer"
                >
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import Tasks (JSON)
                </button>
              </div>
            }
          </div>

          <!-- Hidden JSON File Input Element (Common for Desktop & Mobile) -->
          <input
            #fileInput
            type="file"
            accept=".json"
            class="hidden"
            (change)="onFileSelected($event)"
          />

          <!-- Theme Toggle Button -->
          <button
            type="button"
            (click)="theme.toggleTheme()"
            class="p-2 sm:p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            [title]="theme.currentTheme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
            aria-label="Toggle theme"
          >
            @if (theme.currentTheme() === 'dark') {
              <!-- Sun -->
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            } @else {
              <!-- Moon -->
              <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            }
          </button>

          <!-- + New Task Button (Compact on Mobile, Full on Desktop) -->
          <button
            type="button"
            (click)="store.openCreateModal()"
            class="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all duration-150 cursor-pointer active:scale-95 shrink-0"
            title="Create new task (Press 'C')"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span class="hidden sm:inline">New Task</span>
            <kbd class="hidden sm:inline text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-700 text-indigo-100 opacity-80">
              C
            </kbd>
          </button>
        </div>

      </div>
    </header>
  `
})
export class PlannerHeaderComponent {
  readonly store = inject(WeeklyWorkStore);
  readonly theme = inject(ThemeService);
  private readonly exportImport = inject(ExportImportService);
  private readonly toast = inject(ToastService);

  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;

  isDataMenuOpen = false;
  isMobileMenuOpen = false;

  get carryOverCount(): () => number {
    return () => this.store.carryOverTasks().length;
  }

  toggleDataMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isDataMenuOpen = !this.isDataMenuOpen;
    this.isMobileMenuOpen = false;
  }

  toggleMobileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.isDataMenuOpen = false;
  }

  triggerFileInput(): void {
    this.isDataMenuOpen = false;
    this.isMobileMenuOpen = false;
    this.fileInputRef?.nativeElement.click();
  }

  onSearchChange(value: string): void {
    this.store.setFilters({ searchQuery: value });
  }

  exportJson(): void {
    this.exportImport.exportToJson(this.store.tasks());
    this.toast.success('Tasks exported', 'Exported full task backlog to JSON');
  }

  exportCsv(): void {
    this.exportImport.exportToCsv(this.store.tasks());
    this.toast.success('Tasks exported', 'Exported tasks to CSV spreadsheet');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const tasks = this.exportImport.parseAndValidateJson(text);
        this.store.importTasks(tasks);
      } catch (err: any) {
        this.toast.error('Import failed', err.message || 'Unable to parse file.');
      } finally {
        input.value = '';
      }
    };

    reader.readAsText(file);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    // Cmd+K or Ctrl+K focus search
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInputRef?.nativeElement.focus();
    }

    // Single key shortcuts when not typing in an input
    const tag = (event.target as HTMLElement)?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if (event.key === 'c' || event.key === 'C') {
      event.preventDefault();
      this.store.openCreateModal();
    } else if (event.key === 't' || event.key === 'T') {
      event.preventDefault();
      this.store.navigateWeek('today');
    }
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.isDataMenuOpen = false;
      this.isMobileMenuOpen = false;
    }
  }
}
