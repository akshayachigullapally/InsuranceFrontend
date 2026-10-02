import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-dialog-host',
  standalone: true,
  imports: [FormsModule],
  host: { '(document:keydown.escape)': 'cancel()' },
  template: `
    @if (dialogs.current(); as dialog) {
      <div
        class="fixed inset-0 z-[90] flex items-center justify-center bg-navy-900/50 p-4 backdrop-blur-sm animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        (click)="cancel()"
      >
        <form
          class="w-full max-w-md rounded-2xl bg-white p-6 shadow-elevated animate-fade-in-up"
          (click)="$event.stopPropagation()"
          (ngSubmit)="accept()"
        >
          <div class="flex items-start gap-4">
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
              [class]="dialog.danger ? 'bg-danger-50 text-danger-700' : 'bg-brand-50 text-brand-700'"
              aria-hidden="true"
            >
              {{ dialog.danger ? '!' : '?' }}
            </span>
            <div class="min-w-0 flex-1">
              <h2 id="app-dialog-title" class="text-base font-semibold text-gray-900">{{ dialog.title }}</h2>
              @if (dialog.message) {
                <p class="mt-1.5 text-sm leading-relaxed text-gray-600">{{ dialog.message }}</p>
              }
              @if (dialog.kind === 'prompt') {
                <label class="label-base mt-4" for="app-dialog-input">{{ dialog.inputLabel }}</label>
                <input
                  #promptInput
                  id="app-dialog-input"
                  name="value"
                  class="input-base"
                  [placeholder]="dialog.placeholder ?? ''"
                  [(ngModel)]="value"
                />
              }
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button type="button" class="btn-outline !px-4 !py-2" (click)="cancel()">
              {{ dialog.cancelLabel ?? 'Cancel' }}
            </button>
            <button
              #confirmButton
              type="submit"
              class="!px-4 !py-2"
              [class]="dialog.danger ? 'btn-danger' : 'btn-brand'"
            >
              {{ dialog.confirmLabel ?? 'Confirm' }}
            </button>
          </div>
        </form>
      </div>
    }
  `,
})
export class DialogHostComponent {
  protected readonly dialogs = inject(DialogService);
  protected value = '';

  private readonly promptInput = viewChild<ElementRef<HTMLInputElement>>('promptInput');
  private readonly confirmButton = viewChild<ElementRef<HTMLButtonElement>>('confirmButton');

  constructor() {
    effect(() => {
      const dialog = this.dialogs.current();
      if (!dialog) return;
      this.value = dialog.defaultValue ?? '';
      // Focus the field (or the main button) once the dialog is drawn.
      queueMicrotask(() => {
        const input = this.promptInput()?.nativeElement;
        if (input) {
          input.focus();
          input.select();
        } else {
          this.confirmButton()?.nativeElement.focus();
        }
      });
    });
  }

  protected accept(): void {
    this.dialogs.close(this.value);
  }

  protected cancel(): void {
    this.dialogs.close(null);
  }
}
