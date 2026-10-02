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
    return this.danger() ? 'btn-danger' : 'btn-brand';
  }

  protected confirm(): void {
    this.confirmed.emit();
  }

  protected cancel(): void {
    this.dismissed.emit();
  }
}
