import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  PolicyResponse,
  PolicyTriggerSnapshotResponse,
} from '../../dtos/policies/policy-response.dto';
import { TriggerCondition } from '../../dtos/triggers/trigger-condition.dto';
import { PolicyService } from '../../services/policy.service';
import { UserService } from '../../services/user.service';
import { ZoneService } from '../../services/zone.service';
import { parseLocalDateOnly } from '../../utils/local-date.util';
import {
  clearPoliciesError,
  clearSelectedPolicy,
  loadAdminPolicy,
} from '../../state/policies/policies.actions';
import {
  selectPoliciesError,
  selectPoliciesLoading,
  selectSelectedPolicy,
} from '../../state/policies/policies.selectors';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ParametricTriggerCardComponent } from '../../../shared/components/parametric-trigger-card/parametric-trigger-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface DetailRow {
  label: string;
  value: string;
}

@Component({
  selector: 'app-admin-policy-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    DecimalPipe,
    RouterLink,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    ParametricTriggerCardComponent,
  ],
  providers: [DatePipe],
  templateUrl: './admin-policy-detail.component.html',
})
export class AdminPolicyDetailComponent implements OnInit, OnDestroy {
  readonly policy$: Observable<PolicyResponse | null>;
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  protected invalidPolicyId = false;
  protected snapshot: PolicyTriggerSnapshotResponse | null = null;
  protected snapshotLoading = false;
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
    this.policy$ = this.store.select(selectSelectedPolicy);
    this.loading$ = this.store.select(selectPoliciesLoading);
    this.error$ = this.store.select(selectPoliciesError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearPoliciesError());
    this.store.dispatch(clearSelectedPolicy());

    const policyId = Number(this.route.snapshot.paramMap.get('policyId'));

    if (!Number.isInteger(policyId) || policyId <= 0) {
      this.invalidPolicyId = true;
      return;
    }

    this.store.dispatch(loadAdminPolicy({ policyId }));

    this.policy$.pipe(takeUntil(this.destroy$)).subscribe((policy) => {
      if (!policy || policy.id !== policyId) {
        return;
      }

      this.loadSnapshot(policy);
      this.loadCustomer(policy.customerId);
      this.loadZone(policy.locationZoneId);

      if (policy.reviewedBy) {
        this.loadReviewer(policy.reviewedBy);
      } else {
        this.reviewerName = null;
      }
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
        label: 'Customer',
        value: this.customerName
          ? `${this.customerName} (Customer #${policy.customerId})`
          : `Customer #${policy.customerId}`,
      },
      {
        label: 'Product ID',
        value: `Product #${policy.productId}`,
      },
      {
        label: 'Location zone',
        value: this.zoneName
          ? `${this.zoneName} (Zone #${policy.locationZoneId})`
          : `Zone #${policy.locationZoneId}`,
      },
      {
        label: 'Policy term',
        value: `${policy.termMonths} months`,
      },
      {
        label: 'Coverage start',
        value: this.formatDateOnly(policy.startDate),
      },
      {
        label: 'Coverage end',
        value: this.formatDateOnly(policy.endDate),
      },
      {
        label: 'Created',
        value: this.formatDate(policy.createdAt),
      },
      {
        label: 'Last updated',
        value: this.formatDate(policy.updatedAt),
      },
      {
        label: 'Reviewed by',
        value: policy.reviewedBy
          ? this.reviewerName
            ? `${this.reviewerName} (User #${policy.reviewedBy})`
            : `User #${policy.reviewedBy}`
          : 'Not reviewed',
      },
      {
        label: 'Reviewed at',
        value: this.formatDate(policy.reviewedAt),
      },
    ];
  }

  protected snapshotTrigger(): TriggerCondition | null {
    const snapshot = this.snapshot;

    if (!snapshot) {
      return null;
    }

    return {
      perilCode: snapshot.perilCode,
      measurementType: snapshot.measurementType || snapshot.triggerMetric,
      measurementUnit: snapshot.measurementUnit || snapshot.triggerMetric || undefined,
      thresholdValue: snapshot.thresholdValue ?? snapshot.triggerThreshold ?? 0,
      comparisonOperator:
        snapshot.comparisonOperator ?? snapshot.triggerOperator ?? 'GREATER_THAN_OR_EQUAL',
      aggregationType: snapshot.aggregationType ?? snapshot.triggerAggregationType ?? 'AVERAGE',
      observationWindowHours:
        snapshot.observationWindowHours ?? snapshot.triggerDurationHours ?? 24,
      minimumObservationCount:
        snapshot.minimumObservationCount ?? snapshot.triggerMinObservationCount ?? 2,
      triggerDescription: snapshot.triggerDescription ?? null,
      humanReadableTrigger: snapshot.humanReadableTrigger ?? null,
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
        next: (snapshot) => {
          this.snapshot = snapshot;
          this.snapshotLoading = false;
        },
        error: () => {
          this.snapshot = null;
          this.snapshotLoading = false;
        },
      });
  }

  private loadCustomer(customerId: number): void {
    this.userService
      .getUser(customerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
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
        next: (zone) => {
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
        next: (user) => {
          this.reviewerName = user.fullName;
        },
        error: () => {
          this.reviewerName = null;
        },
      });
  }

  private formatDate(value?: string | null): string {
    if (!value) {
      return 'Not available';
    }

    return this.datePipe.transform(value, 'medium') ?? 'Not available';
  }

  protected formatDateOnly(value?: string | null): string {
    const date = parseLocalDateOnly(value);

    if (!date) {
      return 'Not available';
    }

    return this.datePipe.transform(date, 'mediumDate') ?? 'Not available';
  }
}
