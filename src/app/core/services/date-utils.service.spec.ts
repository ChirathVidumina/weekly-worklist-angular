import { TestBed } from '@angular/core/testing';
import { DateUtilsService } from './date-utils.service';

describe('DateUtilsService', () => {
  let service: DateUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DateUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should accurately calculate Monday of the week', () => {
    // 2026-11-15 is Sunday
    const sunday = new Date(2026, 10, 15);
    const monday = service.getMondayOfWeek(sunday);
    expect(service.formatDateToISO(monday)).toBe('2026-11-09');
  });

  it('should accurately calculate Sunday of the week', () => {
    // 2026-11-09 is Monday
    const monday = new Date(2026, 10, 9);
    const sunday = service.getSundayOfWeek(monday);
    expect(service.formatDateToISO(sunday)).toBe('2026-11-15');
  });

  it('should return exactly 7 days for a week', () => {
    const d = new Date(2026, 10, 11); // Wednesday
    const week = service.getWeekDates(d);
    expect(week.length).toBe(7);
    expect(service.formatDateToISO(week[0])).toBe('2026-11-09');
    expect(service.formatDateToISO(week[6])).toBe('2026-11-15');
  });

  it('should format duration minutes cleanly', () => {
    expect(service.formatMinutes(30)).toBe('30m');
    expect(service.formatMinutes(60)).toBe('1h');
    expect(service.formatMinutes(90)).toBe('1h 30m');
    expect(service.formatMinutes(125)).toBe('2h 5m');
    expect(service.formatMinutes(0)).toBe('0m');
  });
});
