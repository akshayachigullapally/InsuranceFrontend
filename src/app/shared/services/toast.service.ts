import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  icon?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const TOAST_DISPLAY_DURATION_MS = 6000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();
  private nextId = 1;

  show(toast: Omit<Toast, 'id' | 'type'> & { type?: Toast['type'] }): void {
    const id = this.nextId++;
    const entry: Toast = {
      id,
      title: toast.title,
      message: toast.message,
      icon: toast.icon,
      type: toast.type ?? 'info',
    };
    this.toastsSubject.next([...this.toastsSubject.getValue(), entry]);
    window.setTimeout(() => this.dismiss(id), TOAST_DISPLAY_DURATION_MS);
  }

  dismiss(id: number): void {
    this.toastsSubject.next(
      this.toastsSubject.getValue().filter((toast) => toast.id !== id),
    );
  }
}