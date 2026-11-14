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
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
          (click)="onBackdropClick()"
        ></div>

        <!-- Dialog Card -->
        <div
          class="relative w-full max-w-lg bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-10 transform transition-all duration-200"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h3 [id]="titleId" class="text-base font-semibold text-slate-900 dark:text-slate-100">
                {{ title }}
              </h3>
              @if (subtitle) {
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ subtitle }}</p>
              }
            </div>
            <button
              type="button"
              (click)="closed.emit()"
              class="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors focus:outline-none"
              aria-label="Close dialog"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 max-h-[calc(85vh-120px)] overflow-y-auto">
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
