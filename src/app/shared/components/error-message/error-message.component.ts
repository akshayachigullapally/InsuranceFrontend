import { Component, input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  standalone: true,
  templateUrl: './error-message.component.html',
})
export class ErrorMessageComponent {
  readonly error = input<string | null | undefined>(null);
}
