import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
    >
      @for (toast of toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 p-3.5 bg-white dark:bg-[#161924] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl transition-all duration-200 transform translate-y-0"
          role="alert"
        >
          <!-- Icon -->
          <div class="shrink-0 mt-0.5">
            @switch (toast.type) {
              @case ('success') {
                <div class="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              }
              @case ('error') {
                <div class="w-6 h-6 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              }
              @case ('warning') {
                <div class="w-6 h-6 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              }
              @default {
                <div class="w-6 h-6 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              }
            }
          </div>

          <!-- Text -->
          <div class="flex-1 min-w-0">
            <h5 class="text-xs font-semibold text-slate-900 dark:text-slate-100">{{ toast.title }}</h5>
            @if (toast.message) {
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{{ toast.message }}</p>
            }
          </div>

          <!-- Action Button if any -->
          @if (toast.action) {
            <button
              type="button"
              (click)="runAction(toast)"
              class="shrink-0 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1 rounded focus:outline-none"
            >
              {{ toast.action.label }}
            </button>
          }

          <!-- Dismiss -->
          <button
            type="button"
            (click)="dismiss(toast.id)"
            class="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
            aria-label="Dismiss notification"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  private readonly toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }

  runAction(toast: ToastMessage): void {
    if (toast.action) {
      toast.action.run();
      this.dismiss(toast.id);
    }
  }
}
