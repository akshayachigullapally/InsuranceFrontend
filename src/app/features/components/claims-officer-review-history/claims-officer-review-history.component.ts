import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClaimReviewHistoryResponse } from '../../dtos/claims/claim-response.dto';
import { ClaimService } from '../../services/claim.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { CustomerNamePipe } from '../../../shared/pipes/customer-name.pipe';

const ACTION_LABELS: Record<string, string> = {
  REVIEW_STARTED: 'Started review',
  CLAIM_APPROVED: 'Approved',
  CLAIM_REJECTED: 'Rejected',
  CLAIM_SETTLED: 'Settled',
};

/** Every action the signed-in claims officer took on a claim. */
@Component({
  selector: 'app-claims-officer-review-history',
  standalone: true,
  imports: [
    CustomerNamePipe,
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    FormsModule,
    RouterLink,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatCardComponent,
  ],
  templateUrl: './claims-officer-review-history.component.html',
})
export class ClaimsOfficerReviewHistoryComponent implements OnInit {
  protected readonly actionLabels = ACTION_LABELS;
  protected readonly actionFilters = Object.keys(ACTION_LABELS);

  protected readonly entries = signal<ClaimReviewHistoryResponse[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly search = signal('');
  protected readonly action = signal('');

  protected readonly claimsHandled = computed(
    () => new Set(this.entries().map(e => e.claimId)).size,
  );
  protected readonly approvedCount = computed(() => this.count('CLAIM_APPROVED'));
  protected readonly rejectedCount = computed(() => this.count('CLAIM_REJECTED'));
  protected readonly settledCount = computed(() => this.count('CLAIM_SETTLED'));
  protected readonly approvedAmount = computed(() =>
    this.entries()
      .filter(e => e.action === 'CLAIM_APPROVED')
      .reduce((sum, e) => sum + (e.approvedAmount ?? 0), 0),
  );

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const action = this.action();

    return this.entries().filter(e =>
      (!action || e.action === action) &&
      (!term || [e.claimNumber, e.policyNumber, e.notes, String(e.customerId)]
        .some(v => (v ?? '').toLowerCase().includes(term))),
    );
  });

  constructor(private readonly claimService: ClaimService) {}

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.claimService.getReviewHistory().subscribe({
      next: entries => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Your review history could not be loaded. Please try again.');
        this.loading.set(false);
      },
    });
  }

  protected clearFilters(): void {
    this.search.set('');
    this.action.set('');
  }

  protected actionLabel(action: string): string {
    return ACTION_LABELS[action] ?? this.humanize(action);
  }

  protected actionTone(action: string): string {
    switch (action) {
      case 'CLAIM_APPROVED':
        return 'bg-green-100 text-green-800';
      case 'CLAIM_REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CLAIM_SETTLED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  }

  protected humanize(value: string | null | undefined): string {
    if (!value) return '—';
    const text = value.replaceAll('_', ' ').toLowerCase();
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  private count(action: string): number {
    return this.entries().filter(e => e.action === action).length;
  }
}
