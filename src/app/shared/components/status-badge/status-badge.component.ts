import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css',
})
export class StatusBadgeComponent {
  readonly status = input<string>('');
  readonly label = input<string | null>(null);

  protected displayLabel(): string {
    return this.label() ?? this.status();
  }

  protected badgeClass(): string {
    const s = this.status().toUpperCase();
    if (['ACTIVE', 'APPROVED', 'VERIFIED', 'SUCCESS', 'MATCHED'].includes(s)) {
      return 'bg-green-100 text-green-800';
    }
    if (['PENDING', 'SUBMITTED', 'DETECTED', 'RECEIVED'].includes(s)) {
      return 'bg-blue-100 text-blue-800';
    }
    if (['UNDER_REVIEW', 'UNDER_VALIDATION'].includes(s)) {
      return 'bg-amber-100 text-amber-800';
    }
    if (['REJECTED', 'FAILED', 'NOT_MATCHED', 'INSUFFICIENT_OBSERVATIONS'].includes(s)) {
      return 'bg-red-100 text-red-800';
    }
    if (['CANCELLED', 'INACTIVE', 'ARCHIVED', 'DRAFT', 'EXPIRED', 'PROCESSED'].includes(s)) {
      return 'bg-gray-100 text-gray-800';
    }
    return 'bg-gray-100 text-gray-700';
  }

  protected labelClass(): string {
    return this.badgeClass();
  }
}