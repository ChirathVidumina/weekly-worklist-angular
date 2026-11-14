import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {
  private readonly MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  private readonly DAY_NAMES = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  private readonly SHORT_DAY_NAMES = [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
  ];

  /**
   * Returns Monday of the week for a given date
   */
  getMondayOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday
    // Calculate difference to Monday
    // If day is 0 (Sunday), diff is -6 days. If day is 1 (Monday), diff is 0. If day is 2 (Tuesday), diff is -1...
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Returns Sunday of the week for a given date
   */
  getSundayOfWeek(date: Date): Date {
    const monday = this.getMondayOfWeek(date);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return sunday;
  }

  /**
   * Returns 7 dates (Monday through Sunday)
   */
  getWeekDates(date: Date): Date[] {
    const monday = this.getMondayOfWeek(date);
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  }

  /**
   * Format Date to YYYY-MM-DD
   */
  formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parse YYYY-MM-DD to Date in local time
   */
  parseISODate(isoStr: string): Date {
    const [year, month, day] = isoStr.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  }

  /**
   * Format human readable week label, e.g. "Nov 9 – Nov 15, 2026"
   */
  formatWeekLabel(monday: Date, sunday: Date): string {
    const mMonth = this.MONTH_NAMES[monday.getMonth()];
    const mDay = monday.getDate();
    const sMonth = this.MONTH_NAMES[sunday.getMonth()];
    const sDay = sunday.getDate();
    const year = sunday.getFullYear();

    if (monday.getMonth() === sunday.getMonth()) {
      return `${mMonth} ${mDay} – ${sDay}, ${year}`;
    }

    if (monday.getFullYear() === sunday.getFullYear()) {
      return `${mMonth} ${mDay} – ${sMonth} ${sDay}, ${year}`;
    }

    return `${mMonth} ${mDay}, ${monday.getFullYear()} – ${sMonth} ${sDay}, ${year}`;
  }

  /**
   * Returns true if ISO string is today
   */
  isToday(dateStr: string): boolean {
    const today = this.formatDateToISO(new Date());
    return dateStr === today;
  }

  /**
   * Returns true if ISO string is strictly before today
   */
  isPast(dateStr: string): boolean {
    const today = this.formatDateToISO(new Date());
    return dateStr < today;
  }

  /**
   * Returns true if date is Saturday or Sunday
   */
  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  getDayName(date: Date): string {
    return this.DAY_NAMES[date.getDay()];
  }

  getShortDayName(date: Date): string {
    return this.SHORT_DAY_NAMES[date.getDay()];
  }

  getMonthName(date: Date): string {
    return this.MONTH_NAMES[date.getMonth()];
  }

  /**
   * ISO 8601 week number calculation
   */
  getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Format minutes to human string, e.g. 90 -> "1h 30m", 45 -> "45m"
   */
  formatMinutes(minutes: number): string {
    if (!minutes || minutes <= 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }
}
