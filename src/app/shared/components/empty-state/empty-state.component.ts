import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  readonly title = input<string>('No records found');
  readonly message = input<string>('');
  readonly icon = input<string>('📋');
}
