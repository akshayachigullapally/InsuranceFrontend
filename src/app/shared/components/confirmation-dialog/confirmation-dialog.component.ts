import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  templateUrl: './confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent {
  readonly title = input<string>('Are you sure?');
  readonly message = input<string>('');
  readonly confirmLabel = input<string>('Confirm');
  readonly cancelLabel = input<string>('Cancel');
  readonly danger = input<boolean>(false);

  readonly confirmed = output<void>();
  readonly dismissed = output<void>();

  protected confirmClass(): string {
    return this.danger() ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700';
  }

  protected confirm(): void {
    this.confirmed.emit();
  }

  protected cancel(): void {
    this.dismissed.emit();
  }
}
