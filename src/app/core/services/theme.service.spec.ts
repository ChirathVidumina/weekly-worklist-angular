import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { STORAGE_KEYS } from '../constants/storage-keys.constant';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';

    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
  });

  it('should be created and have initial theme set', () => {
    expect(service).toBeTruthy();
    expect(['dark', 'light']).toContain(service.currentTheme());
  });

  it('should apply dark theme classes and data-theme to documentElement', () => {
    service.setTheme('dark');
    TestBed.flushEffects();

    expect(service.currentTheme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe('dark');
  });

  it('should apply light theme classes and remove .dark from documentElement', () => {
    service.setTheme('light');
    TestBed.flushEffects();

    expect(service.currentTheme()).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe('light');
  });

  it('should toggle between dark and light themes reactively', () => {
    service.setTheme('dark');
    TestBed.flushEffects();
    expect(service.currentTheme()).toBe('dark');

    service.toggleTheme();
    TestBed.flushEffects();
    expect(service.currentTheme()).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    service.toggleTheme();
    TestBed.flushEffects();
    expect(service.currentTheme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
