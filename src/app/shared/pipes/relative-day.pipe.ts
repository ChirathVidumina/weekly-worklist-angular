import { Pipe, PipeTransform, inject } from '@angular/core';
import { DateUtilsService } from '../../core/services/date-utils.service';

@Pipe({
  name: 'relativeDay',
  standalone: true
})
export class RelativeDayPipe implements PipeTransform {
  private readonly dateUtils = inject(DateUtilsService);

  transform(dateIso: string | null | undefined): string {
    if (!dateIso) return '';
    const today = this.dateUtils.formatDateToISO(new Date());

    if (dateIso === today) {
      return 'Today';
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateIso === this.dateUtils.formatDateToISO(yesterday)) {
      return 'Yesterday';
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateIso === this.dateUtils.formatDateToISO(tomorrow)) {
      return 'Tomorrow';
    }

    const d = this.dateUtils.parseISODate(dateIso);
    return `${this.dateUtils.getShortDayName(d)}, ${this.dateUtils.getMonthName(d)} ${d.getDate()}`;
  }
}
