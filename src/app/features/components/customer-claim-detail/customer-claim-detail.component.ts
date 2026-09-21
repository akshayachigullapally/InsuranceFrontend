import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ClaimResponse } from '../../dtos/claims/claim-response.dto';
import {
  cancelClaim,
  clearClaimsError,
  clearSelectedClaim,
  loadMyClaim,
} from '../../state/claims/claims.actions';
import {
  selectClaimsError,
  selectClaimsLoading,
  selectClaimsSaving,
  selectSelectedClaim,
} from '../../state/claims/claims.selectors';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface DetailRow {
  label: string;
  value: string;
}

@Component({
  selector: 'app-customer-claim-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    RouterLink,
    ConfirmationDialogComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
  ],
  providers: [DatePipe],
  templateUrl: './customer-claim-detail.component.html',
  styleUrl: './customer-claim-detail.component.css',
})
export class CustomerClaimDetailComponent implements OnInit, OnDestroy {
  readonly claim$: Observable<ClaimResponse | null>;
  readonly loading$: Observable<boolean>;
  readonly saving$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  protected cancelOpen = false;
  protected invalidClaimId = false;

  private claimId = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store,
    private readonly datePipe: DatePipe,
  ) {
    this.claim$ = this.store.select(selectSelectedClaim);
    this.loading$ = this.store.select(selectClaimsLoading);
    this.saving$ = this.store.select(selectClaimsSaving);
    this.error$ = this.store.select(selectClaimsError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearClaimsError());
    this.store.dispatch(clearSelectedClaim());

    const claimId = Number(
      this.route.snapshot.paramMap.get('claimId'),
    );

    if (!Number.isInteger(claimId) || claimId <= 0) {
      this.invalidClaimId = true;
      return;
    }

    this.claimId = claimId;
    this.store.dispatch(loadMyClaim({ claimId }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(clearSelectedClaim());
    this.store.dispatch(clearClaimsError());
  }

  protected claimDetails(claim: ClaimResponse): DetailRow[] {
    return [
      {
        label: 'Policy number',
        value: claim.policyNumber,
      },
      {
        label: 'Incident type',
        value: this.label(claim.incidentType),
      },
      {
        label: 'Incident date',
        value: this.formatDate(claim.incidentDate),
      },
      {
        label: 'Incident location',
        value: claim.incidentLocation,
      },
      {
        label: 'Claimed amount',
        value: this.formatCurrency(claim.claimedAmount),
      },
      {
        label: 'Approved amount',
        value:
          claim.approvedAmount !== null &&
          claim.approvedAmount !== undefined
            ? this.formatCurrency(claim.approvedAmount)
            : 'Not decided',
      },
      {
        label: 'Submitted',
        value: this.formatDateTime(claim.submittedAt),
      },
      {
        label: 'Last updated',
        value: this.formatDateTime(claim.updatedAt),
      },
    ];
  }

  protected triggerDetails(claim: ClaimResponse): DetailRow[] {
    if (claim.manualReviewRequired) {
      return [
        {
          label: 'Claim source',
          value: 'Customer reported (manual)',
        },
        {
          label: 'Evidence',
          value: claim.evidenceDescription ?? 'Not provided',
        },
      ];
    }

    return [
      {
        label: 'Trigger event',
        value: claim.triggerEventReference ?? 'Not available',
      },
      {
        label: 'Trigger event ID',
        value: claim.triggerEventId != null
          ? `Event #${claim.triggerEventId}`
          : 'Not available',
      },
      {
        label: 'Location zone',
        value: `Zone #${claim.locationZoneId}`,
      },
      {
        label: 'Peril ID',
        value: claim.perilId
          ? `Peril #${claim.perilId}`
          : 'Not available',
      },
    ];
  }

  protected openCancel(): void {
    this.store.dispatch(clearClaimsError());
    this.cancelOpen = true;
  }

  protected confirmCancel(): void {
    if (this.claimId <= 0) return;

    this.cancelOpen = false;
    this.store.dispatch(cancelClaim({
      claimId: this.claimId,
    }));
  }

  protected dismissCancel(): void {
    this.cancelOpen = false;
  }

  private label(value: string): string {
    return value
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, character => character.toUpperCase());
  }

  private formatCurrency(value: number): string {
    return `₹ ${value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  private formatDate(value?: string | null): string {
    if (!value) return 'Not available';

    return this.datePipe.transform(
      value,
      'mediumDate',
    ) ?? 'Not available';
  }

  private formatDateTime(value?: string | null): string {
    if (!value) return 'Not available';

    return this.datePipe.transform(
      value,
      'medium',
    ) ?? 'Not available';
  }
}