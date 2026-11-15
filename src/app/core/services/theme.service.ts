import { Injectable, signal, effect } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys.constant';

export type ThemeMode = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly currentTheme = signal<ThemeMode>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const mode = this.currentTheme();
      this.applyTheme(mode);
    });
  }

  toggleTheme(): void {
    const next = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  setTheme(mode: ThemeMode): void {
    this.currentTheme.set(mode);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.THEME, mode);
      localStorage.setItem('theme', mode);
    }
  }

  private getInitialTheme(): ThemeMode {
    if (typeof window === 'undefined') return 'dark';

    const saved = (localStorage.getItem(STORAGE_KEYS.THEME) || localStorage.getItem('theme')) as ThemeMode;
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }

    return 'dark'; // Linear default
  }

  private applyTheme(mode: ThemeMode): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-theme', mode);
    root.style.colorScheme = mode;
  }
}
