import {
  AsyncPipe,
  DatePipe,
  DecimalPipe,
} from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ClaimResponse } from '../../dtos/claims/claim-response.dto';
import {
  clearClaimsError,
  clearSelectedClaim,
  loadAdminClaim,
} from '../../state/claims/claims.actions';
import {
  selectClaimsError,
  selectClaimsLoading,
  selectSelectedClaim,
} from '../../state/claims/claims.selectors';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface DetailRow {
  label: string;
  value: string;
}

@Component({
  selector: 'app-admin-claim-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    RouterLink,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
  ],
  providers: [DatePipe],
  templateUrl: './admin-claim-detail.component.html',
  styleUrl: './admin-claim-detail.component.css',
})
export class AdminClaimDetailComponent implements OnInit, OnDestroy {
  readonly claim$: Observable<ClaimResponse | null>;
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  protected invalidClaimId = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store,
    private readonly datePipe: DatePipe,
  ) {
    this.claim$ = this.store.select(selectSelectedClaim);
    this.loading$ = this.store.select(selectClaimsLoading);
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

    this.store.dispatch(loadAdminClaim({ claimId }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(clearSelectedClaim());
    this.store.dispatch(clearClaimsError());
  }

  protected claimDetails(claim: ClaimResponse): DetailRow[] {
    return [
      {
        label: 'Customer ID',
        value: `Customer #${claim.customerId}`,
      },
      {
        label: 'Policy ID',
        value: `Policy #${claim.policyId}`,
      },
      {
        label: 'Product ID',
        value: `Product #${claim.productId}`,
      },
      {
        label: 'Location zone',
        value: `Zone #${claim.locationZoneId}`,
      },
      {
        label: 'Incident type',
        value: claim.incidentType,
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
        label: 'Claim submitted',
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
        label: 'Trigger event ID',
        value: claim.triggerEventId != null
          ? `Event #${claim.triggerEventId}`
          : 'Not available',
      },
      {
        label: 'Trigger reference',
        value: claim.triggerEventReference ?? 'Not available',
      },
      {
        label: 'Trigger definition ID',
        value: claim.triggerDefinitionId
          ? `Definition #${claim.triggerDefinitionId}`
          : 'Not available',
      },
      {
        label: 'Peril ID',
        value: claim.perilId
          ? `Peril #${claim.perilId}`
          : 'Not available',
      },
    ];
  }

  protected reviewDetails(claim: ClaimResponse): DetailRow[] {
    return [
      {
        label: 'Reviewed by',
        value: claim.reviewedBy
          ? `User #${claim.reviewedBy}`
          : 'Not reviewed',
      },
      {
        label: 'Reviewed at',
        value: this.formatDateTime(claim.reviewedAt),
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
            : 'Not approved',
      },
    ];
  }

  private formatCurrency(value: number): string {
    return `₹ ${value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  private formatDate(value?: string | null): string {
    if (!value) {
      return 'Not available';
    }

    return this.datePipe.transform(
      value,
      'mediumDate',
    ) ?? 'Not available';
  }

  private formatDateTime(value?: string | null): string {
    if (!value) {
      return 'Not available';
    }

    return this.datePipe.transform(
      value,
      'medium',
    ) ?? 'Not available';
  }
}