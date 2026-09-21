import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { ParametricTriggerCardComponent } from './components/parametric-trigger-card/parametric-trigger-card.component';

export const SHARED_IMPORTS = [
  CommonModule,
  ReactiveFormsModule,
  RouterModule,
  LoadingSpinnerComponent,
  ErrorMessageComponent,
  EmptyStateComponent,
  StatusBadgeComponent,
  ParametricTriggerCardComponent,
];

export { provideHttpClient, withInterceptors };

export function validationMessage(controlName: string, errors: Record<string, unknown> | null): string {
  if (!errors) {
    return '';
  }
  if (errors['required']) {
    return `${controlName} is required.`;
  }
  if (errors['email']) {
    return `Please provide a valid email address.`;
  }
  if (errors['minlength']) {
    const err = errors['minlength'] as { requiredLength?: number } | undefined;
    return `${controlName} must be at least ${err?.requiredLength ?? 'n'} characters.`;
  }
  if (errors['maxlength']) {
    const err = errors['maxlength'] as { requiredLength?: number } | undefined;
    return `${controlName} cannot exceed ${err?.requiredLength ?? 'n'} characters.`;
  }
  if (errors['pattern']) {
    return `${controlName} has an invalid format.`;
  }
  if (errors['min']) {
    return `${controlName} is too small.`;
  }
  if (errors['max']) {
    return `${controlName} is too large.`;
  }
  return `${controlName} is invalid.`;
}