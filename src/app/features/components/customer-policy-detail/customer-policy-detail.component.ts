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
  Router,
  RouterLink,
} from '@angular/router';
import { Store } from '@ngrx/store';
import {
  Observable,
  Subject,
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  PolicyResponse,
  PolicyTriggerSnapshotResponse,
} from '../../dtos/policies/policy-response.dto';
import { TriggerCondition } from '../../dtos/triggers/trigger-condition.dto';
import { PolicyService } from '../../services/policy.service';
import { ZoneService } from '../../services/zone.service';
import { parseLocalDateOnly } from '../../utils/local-date.util';
import { blobErrorMessage, saveBlob } from '../../utils/file-download.util';
import {
  cancelPolicy,
  clearPoliciesError,
  clearSelectedPolicy,
  loadMyPolicy,
} from '../../state/policies/policies.actions';
import {
  selectPoliciesError,
  selectPoliciesLoading,
  selectPoliciesSaving,
  selectSelectedPolicy,
} from '../../state/policies/policies.selectors';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ParametricTriggerCardComponent } from '../../../shared/components/parametric-trigger-card/parametric-trigger-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface DetailRow {
  label: string;
  value: string;
}

@Component({
  selector: 'app-customer-policy-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    DecimalPipe,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    StatusBadgeComponent,
    ConfirmationDialogComponent,
    ParametricTriggerCardComponent,
  ],
  providers: [DatePipe],
  templateUrl: './customer-policy-detail.component.html',
  styleUrl: './customer-policy-detail.component.css',
})
export class CustomerPolicyDetailComponent implements OnInit, OnDestroy {
  readonly policy$: Observable<PolicyResponse | null>;
  readonly loading$: Observable<boolean>;
  readonly saving$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  protected cancelOpen = false;
  protected snapshot: PolicyTriggerSnapshotResponse | null = null;
  protected snapshotLoading = false;
  protected zoneName: string | null = null;
  protected actionBusy: 'renew' | 'autoRenew' | 'certificate' | null = null;
  protected actionError: string | null = null;

  private policyId = 0;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store,
    private readonly datePipe: DatePipe,
    private readonly policyService: PolicyService,
    private readonly zoneService: ZoneService,
    private readonly router: Router,
  ) {
    this.policy$ = this.store.select(selectSelectedPolicy);
    this.loading$ = this.store.select(selectPoliciesLoading);
    this.saving$ = this.store.select(selectPoliciesSaving);
    this.error$ = this.store.select(selectPoliciesError);
  }

  ngOnInit(): void {
    // Follow the route param: renewing navigates from one policy page to another.
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const policyId = Number(params.get('policyId'));

        if (!Number.isInteger(policyId) || policyId <= 0) {
          return;
        }

        this.policyId = policyId;
        this.snapshot = null;
        this.zoneName = null;
        this.actionError = null;
        this.store.dispatch(loadMyPolicy({ policyId }));
      });

    this.policy$
      .pipe(takeUntil(this.destroy$))
      .subscribe(policy => {
        if (!policy || policy.id !== this.policyId) {
          return;
        }

        this.loadSnapshot(policy);
        this.loadZone(policy.locationZoneId);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearSelectedPolicy());
    this.store.dispatch(clearPoliciesError());
  }

  protected details(policy: PolicyResponse): DetailRow[] {
    return [
      {
        label: 'Product',
        value: `${policy.productName} (${policy.productCode})`,
      },
      {
        label: 'Sum insured',
        value: `₹ ${policy.sumInsured.toLocaleString('en-IN')}`,
      },
      {
        label: 'Premium',
        value: `₹ ${policy.premiumAmount.toLocaleString('en-IN')}`,
      },
      {
        label: 'Term',
        value: `${policy.termMonths} months`,
      },
      {
        label: 'Location zone',
        value: this.zoneName
          ? `${this.zoneName} (Zone #${policy.locationZoneId})`
          : `Zone #${policy.locationZoneId}`,
      },
      {
        label: 'Coverage period',
        value:
          policy.startDate && policy.endDate
            ? `${this.formatDateOnly(policy.startDate)} to ${this.formatDateOnly(policy.endDate)}`
            : 'Starts on approval',
      },
      {
        label: 'Application date',
        value: this.formatDate(policy.createdAt),
      },
      {
        label: 'Reviewed date',
        value: this.formatDate(policy.reviewedAt),
      },
    ];
  }

  protected openCancel(): void {
    this.store.dispatch(clearPoliciesError());
    this.cancelOpen = true;
  }

  protected confirmCancel(): void {
    if (this.policyId <= 0) {
      return;
    }

    this.cancelOpen = false;
    this.store.dispatch(cancelPolicy({
      policyId: this.policyId,
    }));
  }

  protected dismissCancel(): void {
    this.cancelOpen = false;
  }

  protected snapshotTrigger(): TriggerCondition | null {
    const snapshot = this.snapshot;

    if (!snapshot) {
      return null;
    }

    const unit = snapshot.measurementUnit || snapshot.triggerMetric || null;

    return {
      perilCode: snapshot.perilCode,
      measurementType: snapshot.measurementType || snapshot.triggerMetric,
      measurementUnit: unit ?? undefined,
      thresholdValue: snapshot.thresholdValue ??
        snapshot.triggerThreshold ??
        0,
      comparisonOperator: snapshot.comparisonOperator ??
        snapshot.triggerOperator ??
        'GREATER_THAN_OR_EQUAL',
      aggregationType: snapshot.aggregationType ??
        snapshot.triggerAggregationType ??
        'AVERAGE',
      observationWindowHours: snapshot.observationWindowHours ??
        snapshot.triggerDurationHours ??
        24,
      minimumObservationCount: snapshot.minimumObservationCount ??
        snapshot.triggerMinObservationCount ??
        2,
      triggerDescription:
        snapshot.triggerDescription ?? null,
      humanReadableTrigger:
        snapshot.humanReadableTrigger ?? null,
    };
  }

  private loadSnapshot(policy: PolicyResponse): void {
    if (!policy.triggerSnapshotId) {
      this.snapshot = null;
      this.snapshotLoading = false;
      return;
    }

    this.snapshotLoading = true;

    this.policyService
      .getPolicySnapshot(policy.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: snapshot => {
          this.snapshot = snapshot;
          this.snapshotLoading = false;
        },
        error: () => {
          this.snapshot = null;
          this.snapshotLoading = false;
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

  private formatDate(value?: string | null): string {
    if (!value) {
      return 'Not available';
    }

    return this.datePipe.transform(
      value,
      'mediumDate',
    ) ?? 'Not available';
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

  /** Active in its last 30 days, or expired within the last 30 days. */
  protected renewalState(policy: PolicyResponse): 'open' | 'notYet' | 'closed' | null {
    if (!policy.endDate || (policy.status !== 'ACTIVE' && policy.status !== 'EXPIRED')) {
      return null;
    }
    const end = parseLocalDateOnly(policy.endDate);
    if (!end) {
      return null;
    }
    const days = (end.getTime() - Date.now()) / 86_400_000;
    if (policy.status === 'ACTIVE') {
      return days <= 30 ? 'open' : 'notYet';
    }
    return days >= -30 ? 'open' : 'closed';
  }

  protected renewalOpensOn(policy: PolicyResponse): string {
    const end = parseLocalDateOnly(policy.endDate);
    if (!end) {
      return '';
    }
    end.setDate(end.getDate() - 30);
    return this.datePipe.transform(end, 'mediumDate') ?? '';
  }

  protected renew(policy: PolicyResponse): void {
    this.actionBusy = 'renew';
    this.actionError = null;
    this.policyService
      .renewPolicy(policy.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: renewal => {
          this.actionBusy = null;
          void this.router.navigate(['/customer/policies', renewal.id]);
        },
        error: (error: unknown) => {
          this.actionBusy = null;
          this.actionError = errorMessage(error, 'Could not renew this policy.');
        },
      });
  }

  protected toggleAutoRenew(policy: PolicyResponse): void {
    this.actionBusy = 'autoRenew';
    this.actionError = null;
    this.policyService
      .setAutoRenew(policy.id, !policy.autoRenew)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.actionBusy = null;
          this.store.dispatch(loadMyPolicy({ policyId: policy.id }));
        },
        error: (error: unknown) => {
          this.actionBusy = null;
          this.actionError = errorMessage(error, 'Could not change auto-renew.');
        },
      });
  }

  protected downloadCertificate(policy: PolicyResponse): void {
    this.actionBusy = 'certificate';
    this.actionError = null;
    this.policyService
      .downloadCertificate(policy.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: blob => {
          this.actionBusy = null;
          saveBlob(blob, `${policy.policyNumber}-certificate.pdf`);
        },
        error: async (error: unknown) => {
          this.actionBusy = null;
          this.actionError = await blobErrorMessage(error, 'Could not download the certificate.');
        },
      });
  }
}

function errorMessage(error: unknown, fallback: string): string {
  return (error as { error?: { message?: string } })?.error?.message ?? fallback;
}
