import { Component, computed, input } from '@angular/core';

type Tone = 'green' | 'blue' | 'amber' | 'red' | 'gray' | 'violet';

/** Colour family for each status the platform uses. Unknown statuses fall back to neutral grey. */
const TONES: Record<string, Tone> = {
  ACTIVE: 'green', APPROVED: 'green', VERIFIED: 'green', SUCCESS: 'green', MATCHED: 'green',
  SETTLED: 'green', ACCEPTED: 'green', DELIVERED: 'green', NORMAL: 'green',
  PENDING: 'blue', SUBMITTED: 'blue', DETECTED: 'blue', RECEIVED: 'blue', CREATED: 'blue',
  UNDER_REVIEW: 'amber', UNDER_VALIDATION: 'amber', PROCESSING: 'amber', APPROACHING: 'amber',
  REJECTED: 'red', FAILED: 'red', NOT_MATCHED: 'red', INSUFFICIENT_OBSERVATIONS: 'red', SUSPENDED: 'red',
  REFUNDED: 'violet', CONSUMED: 'violet',
  CANCELLED: 'gray', INACTIVE: 'gray', ARCHIVED: 'gray', DRAFT: 'gray', EXPIRED: 'gray',
  PROCESSED: 'gray', SKIPPED: 'gray', NO_DATA: 'gray',
};

const TONE_CLASSES: Record<Tone, { badge: string; dot: string }> = {
  green: { badge: 'bg-green-50 text-green-800 ring-green-600/20', dot: 'bg-green-500' },
  blue: { badge: 'bg-blue-50 text-blue-800 ring-blue-600/20', dot: 'bg-blue-500' },
  amber: { badge: 'bg-amber-50 text-amber-800 ring-amber-600/25', dot: 'bg-amber-500' },
  red: { badge: 'bg-red-50 text-red-800 ring-red-600/20', dot: 'bg-red-500' },
  violet: { badge: 'bg-violet-50 text-violet-800 ring-violet-600/20', dot: 'bg-violet-500' },
  gray: { badge: 'bg-gray-100 text-gray-700 ring-gray-500/20', dot: 'bg-gray-400' },
};

/** "UNDER_REVIEW" → "Under review". */
export function humanizeStatus(status: string): string {
  const words = status.trim().replace(/_/g, ' ').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
})
export class StatusBadgeComponent {
  readonly status = input<string>('');
  readonly label = input<string | null>(null);

  private readonly tone = computed<Tone>(() => TONES[this.status().trim().toUpperCase()] ?? 'gray');

  protected readonly displayLabel = computed(() => this.label() ?? humanizeStatus(this.status()));

  protected readonly badgeClass = computed(() => TONE_CLASSES[this.tone()].badge);

  protected readonly dotClass = computed(() => TONE_CLASSES[this.tone()].dot);
}
