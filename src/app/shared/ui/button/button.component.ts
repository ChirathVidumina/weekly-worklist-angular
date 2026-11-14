import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      (click)="onClick($event)"
      class="inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg cursor-pointer select-none active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100"
      [ngClass]="[variantClasses, sizeClasses, customClass]"
    >
      @if (loading) {
        <svg class="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      }
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'secondary';
  @Input() size: ButtonSize = 'sm';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() customClass = '';

  @Output() clicked = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }

  get variantClasses(): string {
    switch (this.variant) {
      case 'primary':
        return 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs font-semibold';
      case 'secondary':
        return 'bg-white dark:bg-[#1a1e2d] hover:bg-slate-100 dark:hover:bg-[#252b3f] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xs';
      case 'outline':
        return 'bg-transparent border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60';
      case 'ghost':
        return 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300';
      case 'subtle':
        return 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200';
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs';
      default:
        return '';
    }
  }

  get sizeClasses(): string {
    switch (this.size) {
      case 'xs':
        return 'text-xs px-2 py-1 gap-1';
      case 'sm':
        return 'text-xs px-3 py-1.5 gap-1.5';
      case 'lg':
        return 'text-sm px-4 py-2.5 gap-2';
      case 'md':
      default:
        return 'text-sm px-3.5 py-2 gap-2';
    }
  }
}
