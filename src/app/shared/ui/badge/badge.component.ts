import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'urgent' | 'high' | 'medium' | 'low';
export type BadgeSize = 'xs' | 'sm' | 'md';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center gap-1.5 font-medium rounded-md transition-colors"
      [ngClass]="[variantClasses, sizeClasses]"
    >
      @if (dot) {
        <span class="w-1.5 h-1.5 rounded-full" [ngClass]="dotClasses"></span>
      }
      <ng-content></ng-content>
    </span>
  `
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'neutral';
  @Input() size: BadgeSize = 'sm';
  @Input() dot = false;

  get variantClasses(): string {
    switch (this.variant) {
      case 'primary':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20';
      case 'urgent':
      case 'danger':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
      case 'high':
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'medium':
      case 'info':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
      case 'success':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'low':
      case 'neutral':
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
    }
  }

  get sizeClasses(): string {
    switch (this.size) {
      case 'xs':
        return 'text-[10px] px-1.5 py-0.5 tracking-tight';
      case 'md':
        return 'text-xs px-2.5 py-1 tracking-normal';
      case 'sm':
      default:
        return 'text-[11px] px-2 py-0.5 tracking-tight';
    }
  }

  get dotClasses(): string {
    switch (this.variant) {
      case 'primary': return 'bg-indigo-500';
      case 'urgent':
      case 'danger': return 'bg-rose-500';
      case 'high':
      case 'warning': return 'bg-amber-500';
      case 'medium':
      case 'info': return 'bg-blue-500';
      case 'success': return 'bg-emerald-500';
      default: return 'bg-slate-400';
    }
  }
}
