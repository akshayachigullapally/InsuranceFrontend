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

  private policyId = 0;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store,
    private readonly datePipe: DatePipe,
    private readonly policyService: PolicyService,
    private readonly zoneService: ZoneService,
  ) {
    this.policy$ = this.store.select(selectSelectedPolicy);
    this.loading$ = this.store.select(selectPoliciesLoading);
    this.saving$ = this.store.select(selectPoliciesSaving);
    this.error$ = this.store.select(selectPoliciesError);
  }

  ngOnInit(): void {
    const policyId = Number(
      this.route.snapshot.paramMap.get('policyId'),
    );

    if (!Number.isInteger(policyId) || policyId <= 0) {
      return;
    }

    this.policyId = policyId;
    this.store.dispatch(loadMyPolicy({ policyId }));

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
}