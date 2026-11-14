import { Component, Input, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-ring',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative inline-flex items-center justify-center" [style.width.px]="size" [style.height.px]="size">
      <svg [attr.width]="size" [attr.height]="size" class="transform -rotate-90">
        <!-- Track -->
        <circle
          [attr.stroke]="trackColor"
          [attr.stroke-width]="strokeWidth"
          fill="transparent"
          [attr.r]="radius"
          [attr.cx]="center"
          [attr.cy]="center"
        />
        <!-- Indicator -->
        <circle
          [attr.stroke]="indicatorColor"
          [attr.stroke-width]="strokeWidth"
          stroke-linecap="round"
          fill="transparent"
          [attr.r]="radius"
          [attr.cx]="center"
          [attr.cy]="center"
          [style.stroke-dasharray]="circumference"
          [style.stroke-dashoffset]="dashOffset"
          class="transition-all duration-500 ease-out"
        />
      </svg>
      @if (showText) {
        <span class="absolute font-semibold text-slate-800 dark:text-slate-100" [ngClass]="textSizeClasses">
          {{ percentage }}%
        </span>
      }
    </div>
  `
})
export class ProgressRingComponent {
  @Input() percentage = 0;
  @Input() size = 40;
  @Input() strokeWidth = 3.5;
  @Input() trackColor = 'currentColor';
  @Input() indicatorColor = '#6366f1'; // Indigo
  @Input() showText = true;

  get center(): number {
    return this.size / 2;
  }

  get radius(): number {
    return (this.size - this.strokeWidth) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get dashOffset(): number {
    const clamped = Math.min(100, Math.max(0, this.percentage));
    return this.circumference - (clamped / 100) * this.circumference;
  }

  get textSizeClasses(): string {
    if (this.size <= 32) return 'text-[9px]';
    if (this.size <= 48) return 'text-[11px]';
    return 'text-xs';
  }
}
