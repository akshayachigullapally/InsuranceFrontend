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
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClaimResponse } from '../../dtos/claims/claim-response.dto';
import { PolicyResponse } from '../../dtos/policies/policy-response.dto';
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
import { PolicyService } from '../../services/policy.service';
import { UserService } from '../../services/user.service';
import { ZoneService } from '../../services/zone.service';
import { parseLocalDateOnly } from '../../utils/local-date.util';

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
  protected policy: PolicyResponse | null = null;
  protected policyLoading = false;
  protected customerName: string | null = null;
  protected reviewerName: string | null = null;
  protected zoneName: string | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store,
    private readonly datePipe: DatePipe,
    private readonly policyService: PolicyService,
    private readonly userService: UserService,
    private readonly zoneService: ZoneService,
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

    this.claim$
      .pipe(takeUntil(this.destroy$))
      .subscribe(claim => {
        if (!claim || claim.id !== claimId) {
          return;
        }

        this.loadPolicy(claim.policyId);
        this.loadCustomer(claim.customerId);
        this.loadZone(claim.locationZoneId);

        if (claim.reviewedBy) {
          this.loadReviewer(claim.reviewedBy);
        } else {
          this.reviewerName = null;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearSelectedClaim());
    this.store.dispatch(clearClaimsError());
  }

  protected policyDetails(policy: PolicyResponse): DetailRow[] {
    return [
      {
        label: 'Policy number',
        value: policy.policyNumber,
      },
      {
        label: 'Product',
        value: `${policy.productName} (${policy.productCode})`,
      },
      {
        label: 'Status',
        value: policy.status,
      },
      {
        label: 'Sum insured',
        value: this.formatCurrency(policy.sumInsured),
      },
      {
        label: 'Premium',
        value: this.formatCurrency(policy.premiumAmount),
      },
      {
        label: 'Coverage start',
        value: this.formatDateOnly(policy.startDate),
      },
      {
        label: 'Coverage end',
        value: this.formatDateOnly(policy.endDate),
      },
    ];
  }

  protected claimDetails(claim: ClaimResponse): DetailRow[] {
    return [
      {
        label: 'Customer',
        value: this.customerName
          ? `${this.customerName} (Customer #${claim.customerId})`
          : `Customer #${claim.customerId}`,
      },
      {
        label: 'Policy',
        value: this.policy
          ? `${this.policy.policyNumber} (Policy #${claim.policyId})`
          : `Policy #${claim.policyId}`,
      },
      {
        label: 'Product ID',
        value: `Product #${claim.productId}`,
      },
      {
        label: 'Location zone',
        value: this.zoneName
          ? `${this.zoneName} (Zone #${claim.locationZoneId})`
          : `Zone #${claim.locationZoneId}`,
      },
      {
        label: 'Incident type',
        value: claim.incidentType,
      },
      {
        label: 'Incident date',
        value: this.formatDateOnly(claim.incidentDate),
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
          ? (this.reviewerName
              ? `${this.reviewerName} (User #${claim.reviewedBy})`
              : `User #${claim.reviewedBy}`)
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

  private loadPolicy(policyId: number): void {
    this.policyLoading = true;

    this.policyService
      .getPolicy(policyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: policy => {
          this.policy = policy;
          this.policyLoading = false;
        },
        error: () => {
          this.policy = null;
          this.policyLoading = false;
        },
      });
  }

  private loadCustomer(customerId: number): void {
    this.userService
      .getUser(customerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: user => {
          this.customerName = user.fullName;
        },
        error: () => {
          this.customerName = null;
        },
      });
  }

  private loadZone(locationZoneId: number): void {
    this.zoneService
      .getZone(locationZoneId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: zone => {
          this.zoneName = zone.zoneName;
        },
        error: () => {
          this.zoneName = null;
        },
      });
  }

  private loadReviewer(reviewerId: number): void {
    this.userService
      .getUser(reviewerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: user => {
          this.reviewerName = user.fullName;
        },
        error: () => {
          this.reviewerName = null;
        },
      });
  }

  protected formatDateOnly(value?: string | null): string {
    const date = parseLocalDateOnly(value);

    if (!date) {
      return 'Not available';
    }

    return this.datePipe.transform(
      date,
      'mediumDate',
    ) ?? 'Not available';
  }

  private formatCurrency(value: number): string {
    return `₹ ${value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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