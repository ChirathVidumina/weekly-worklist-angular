import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { WeeklyWorkStore } from '../../../../core/store';
import { DayColumnComponent } from '../day-column/day-column.component';

@Component({
  selector: 'app-desktop-week-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, DayColumnComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full overflow-x-auto pb-4 pt-2">
      <div class="grid grid-cols-7 gap-3 min-w-[1100px] h-full items-stretch">
        @for (day of schedule().days; track day.date) {
          <div class="flex flex-col min-h-[500px]">
            <app-day-column
              [day]="day"
              [connectedDropLists]="allDropListIds()"
            />
          </div>
        }
      </div>
    </div>
  `
})
export class DesktopWeekBoardComponent {
  private readonly store = inject(WeeklyWorkStore);

  readonly schedule = this.store.weekSchedule;

  readonly allDropListIds = computed(() => {
    return this.schedule().days.map(d => 'day-list-' + d.date);
  });
}
