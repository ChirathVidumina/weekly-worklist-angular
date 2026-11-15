import { Component, Input, Output, EventEmitter, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200"
          (click)="onBackdropClick()"
        ></div>

        <!-- Dialog Card (Bottom-sheet on mobile, centered modal on tablet/desktop) -->
        <div
          class="relative w-full sm:max-w-lg bg-white dark:bg-[#12141c] border-t sm:border border-slate-200/90 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92dvh] sm:max-h-[88vh] transform transition-all duration-200"
          (click)="$event.stopPropagation()"
        >
          <!-- Mobile Bottom-Sheet Pull Handle -->
          <div class="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden shrink-0"></div>

          <!-- Header -->
          <div class="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
            <div>
              <h3 [id]="titleId" class="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                {{ title }}
              </h3>
              @if (subtitle) {
                <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ subtitle }}</p>
              }
            </div>
            <button
              type="button"
              (click)="closed.emit()"
              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors focus:outline-none cursor-pointer"
              aria-label="Close dialog"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Scrollable Body with overscroll containment -->
          <div class="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1 overscroll-contain">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `
})
export class ModalDialogComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() titleId = 'modal-title';
  @Input() closeOnBackdrop = true;

  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.closed.emit();
    }
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop) {
      this.closed.emit();
    }
  }
}
