import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastAction {
  label: string;
  run: () => void;
}

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: ToastAction;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(toast: Omit<ToastMessage, 'id'>): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration ?? 4000
    };

    this._toasts.update(current => [newToast, ...current].slice(0, 5));

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, newToast.duration);
    }

    return id;
  }

  success(title: string, message?: string, action?: ToastAction): string {
    return this.show({ type: 'success', title, message, action });
  }

  info(title: string, message?: string, action?: ToastAction): string {
    return this.show({ type: 'info', title, message, action });
  }

  warning(title: string, message?: string, action?: ToastAction): string {
    return this.show({ type: 'warning', title, message, action });
  }

  error(title: string, message?: string, action?: ToastAction): string {
    return this.show({ type: 'error', title, message, action });
  }

  dismiss(id: string): void {
    this._toasts.update(current => current.filter(t => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}
