import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  templateUrl: './loading-spinner.component.html',
})
export class LoadingSpinnerComponent {
  readonly label = input<string>('');
}
