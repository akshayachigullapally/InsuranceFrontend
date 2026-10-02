import { Injectable, signal } from '@angular/core';

export interface DialogOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export interface PromptOptions extends DialogOptions {
  inputLabel: string;
  defaultValue?: string;
  placeholder?: string;
}

export interface OpenDialog extends DialogOptions {
  kind: 'confirm' | 'prompt';
  inputLabel?: string;
  defaultValue?: string;
  placeholder?: string;
  resolve: (value: string | null) => void;
}

/**
 * In-app replacement for window.confirm / window.prompt. The dialog itself is
 * drawn by <app-dialog-host> in the root component, so it always matches the theme.
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly openDialog = signal<OpenDialog | null>(null);
  readonly current = this.openDialog.asReadonly();

  /** Resolves true when the user confirms, false when they cancel. */
  confirm(options: DialogOptions): Promise<boolean> {
    return this.open({ ...options, kind: 'confirm' }).then((value) => value !== null);
  }

  /** Resolves the typed text, or null when the user cancels. */
  prompt(options: PromptOptions): Promise<string | null> {
    return this.open({ ...options, kind: 'prompt' });
  }

  close(value: string | null): void {
    const dialog = this.openDialog();
    if (!dialog) return;
    this.openDialog.set(null);
    dialog.resolve(value);
  }

  private open(dialog: Omit<OpenDialog, 'resolve'>): Promise<string | null> {
    // A new dialog replaces any one still open; the old one counts as cancelled.
    this.close(null);
    return new Promise((resolve) => this.openDialog.set({ ...dialog, resolve }));
  }
}
