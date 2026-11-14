import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center p-6 text-center select-none py-10">
      <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3 shadow-xs">
        @if (icon === 'calendar') {
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        } @else if (icon === 'search') {
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        } @else {
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        }
      </div>
      <h4 class="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">{{ title }}</h4>
      <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4 leading-relaxed">{{ message }}</p>
      @if (actionLabel) {
        <app-button variant="primary" size="xs" (clicked)="action.emit()">
          <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          {{ actionLabel }}
        </app-button>
      }
    </div>
  `
})
export class EmptyStateComponent {
  @Input() title = 'No tasks found';
  @Input() message = 'Plan and schedule work to stay aligned with your weekly sprint commitments.';
  @Input() icon: 'calendar' | 'search' | 'check' = 'calendar';
  @Input() actionLabel?: string;

  @Output() action = new EventEmitter<void>();
}
