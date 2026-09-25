import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PolicyReviewHistoryResponse } from '../../dtos/policies/policy-response.dto';
import { PolicyService } from '../../services/policy.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

type DecisionFilter = '' | 'APPROVED' | 'REJECTED';

/** Every policy the signed-in underwriter approved or rejected. */
@Component({
  selector: 'app-underwriter-review-history',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    RouterLink,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatCardComponent,
  ],
  templateUrl: './underwriter-review-history.component.html',
})
export class UnderwriterReviewHistoryComponent implements OnInit {
  protected readonly entries = signal<PolicyReviewHistoryResponse[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly search = signal('');
  protected readonly decision = signal<DecisionFilter>('');

  protected readonly approvedCount = computed(
    () => this.entries().filter(e => e.decision === 'APPROVED').length,
  );
  protected readonly rejectedCount = computed(
    () => this.entries().filter(e => e.decision === 'REJECTED').length,
  );
  protected readonly approvedCover = computed(() =>
    this.entries()
      .filter(e => e.decision === 'APPROVED')
      .reduce((sum, e) => sum + (e.sumInsured ?? 0), 0),
  );

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const decision = this.decision();

    return this.entries().filter(e =>
      (!decision || e.decision === decision) &&
      (!term || [e.policyNumber, e.productName, e.productCode, e.reason, String(e.customerId)]
        .some(v => (v ?? '').toLowerCase().includes(term))),
    );
  });

  constructor(private readonly policyService: PolicyService) {}

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.policyService.getReviewHistory().subscribe({
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
    this.decision.set('');
  }

  protected humanize(value: string | null | undefined): string {
    if (!value) return '—';
    const text = value.replaceAll('_', ' ').toLowerCase();
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
