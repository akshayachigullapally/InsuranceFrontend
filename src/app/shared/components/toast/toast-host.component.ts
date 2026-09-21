import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div
      class="pointer-events-none fixed top-20 right-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
      aria-live="polite"
      role="status"
    >
      @for (toast of toastService.toasts$ | async; track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-4 shadow-elevated animate-fade-in-up"
          [class]="borderClass(toast.type)"
          role="alert"
        >
          @if (toast.icon) {
            <span class="text-xl" aria-hidden="true">{{ toast.icon }}</span>
          }
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-gray-900">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="mt-0.5 text-xs text-gray-600 break-words">{{ toast.message }}</p>
            }
          </div>
          <button
            type="button"
            class="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Dismiss notification"
            (click)="toastService.dismiss(toast.id)"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastHostComponent {
  readonly toastService = inject(ToastService);

  protected borderClass(type: 'info' | 'success' | 'warning' | 'error'): string {
    switch (type) {
      case 'success':
        return 'border-green-200';
      case 'warning':
        return 'border-orange-200';
      case 'error':
        return 'border-red-200';
      default:
        return 'border-brand-100';
    }
  }
}