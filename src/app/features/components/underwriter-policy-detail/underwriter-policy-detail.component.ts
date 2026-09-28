import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  PolicyResponse,
  PolicyTriggerSnapshotResponse,
} from '../../dtos/policies/policy-response.dto';
import { ProductResponse } from '../../dtos/products/product-response.dto';
import { TriggerCondition } from '../../dtos/triggers/trigger-condition.dto';
import {
  approvePolicy,
  clearPoliciesError,
  clearSelectedPolicy,
  loadAdminPolicy,
  rejectPolicy,
} from '../../state/policies/policies.actions';
import {
  selectPoliciesError,
  selectPoliciesLoading,
  selectPoliciesSaving,
  selectSelectedPolicy,
} from '../../state/policies/policies.selectors';
import { PolicyService } from '../../services/policy.service';
import { ProductService } from '../../services/product.service';
import { UserService } from '../../services/user.service';
import { ZoneService } from '../../services/zone.service';
import { parseLocalDateOnly } from '../../utils/local-date.util';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ParametricTriggerCardComponent } from '../../../shared/components/parametric-trigger-card/parametric-trigger-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface DetailRow {
  label: string;
  value: string;
}

interface RejectionForm {
  reason: FormControl<string>;
}

@Component({
  selector: 'app-underwriter-policy-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    StatusBadgeComponent,
    ConfirmationDialogComponent,
    ParametricTriggerCardComponent,
  ],
  providers: [DatePipe],
  templateUrl: './underwriter-policy-detail.component.html',
})
export class UnderwriterPolicyDetailComponent implements OnInit, OnDestroy {
  readonly policy$: Observable<PolicyResponse | null>;
  readonly loading$: Observable<boolean>;
  readonly saving$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  readonly rejectionForm = new FormGroup<RejectionForm>({
    reason: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500), Validators.pattern(/\S+/)],
    }),
  });

  protected approveOpen = false;
  protected rejectOpen = false;
  protected invalidPolicyId = false;
  protected zoneName: string | null = null;
  protected customerName: string | null = null;
  protected product: ProductResponse | null = null;
  protected productLoading = false;
  protected snapshot: PolicyTriggerSnapshotResponse | null = null;
  protected snapshotLoading = false;

  private policyId = 0;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store,
    private readonly datePipe: DatePipe,
    private readonly zoneService: ZoneService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly policyService: PolicyService,
  ) {
    this.policy$ = this.store.select(selectSelectedPolicy);
    this.loading$ = this.store.select(selectPoliciesLoading);
    this.saving$ = this.store.select(selectPoliciesSaving);
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

    this.policyId = policyId;
    this.store.dispatch(loadAdminPolicy({ policyId }));

    this.policy$.pipe(takeUntil(this.destroy$)).subscribe((policy) => {
      if (!policy || policy.id !== policyId) {
        return;
      }

      this.loadZone(policy.locationZoneId);
      this.loadCustomer(policy.customerId);
      this.loadProduct(policy.productId);
      this.loadSnapshot(policy);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearSelectedPolicy());
    this.store.dispatch(clearPoliciesError());
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

  private loadProduct(productId: number): void {
    this.productLoading = true;

    this.productService
      .getProduct(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          this.product = product;
          this.productLoading = false;
        },
        error: () => {
          this.product = null;
          this.productLoading = false;
        },
      });
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

  protected details(policy: PolicyResponse): DetailRow[] {
    return [
      {
        label: 'Customer',
        value: this.customerName
          ? `${this.customerName} (Customer #${policy.customerId})`
          : `Customer #${policy.customerId}`,
      },
      {
        label: 'Product',
        value: `${policy.productName} (${policy.productCode})`,
      },
      {
        label: 'Location zone',
        value: this.zoneName
          ? `${this.zoneName} (Zone #${policy.locationZoneId})`
          : `Zone #${policy.locationZoneId}`,
      },
      {
        label: 'Sum insured',
        value: `₹ ${policy.sumInsured.toLocaleString('en-IN')}`,
      },
      {
        label: 'Premium',
        value: `₹ ${policy.premiumAmount.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      },
      {
        label: 'Policy term',
        value: `${policy.termMonths} months`,
      },
      {
        label: 'Submitted',
        value: this.formatDate(policy.createdAt),
      },
      {
        label: 'Last updated',
        value: this.formatDate(policy.updatedAt),
      },
      {
        label: 'Coverage start',
        value: policy.startDate
          ? this.formatDateOnly(policy.startDate)
          : this.estimatedCoverageLabel(policy, 'start'),
      },
      {
        label: 'Coverage end',
        value: policy.endDate
          ? this.formatDateOnly(policy.endDate)
          : this.estimatedCoverageLabel(policy, 'end'),
      },
    ];
  }

  private estimatedCoverageLabel(policy: PolicyResponse, edge: 'start' | 'end'): string {
    if (policy.status !== 'PENDING') {
      return 'Not available';
    }

    const start = new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + policy.termMonths);

    const date = edge === 'start' ? start : end;
    const formatted = this.datePipe.transform(date, 'mediumDate') ?? 'Not available';

    return `${formatted} (estimated, assigned on approval)`;
  }

  protected openApproval(): void {
    this.store.dispatch(clearPoliciesError());
    this.approveOpen = true;
  }

  protected confirmApproval(): void {
    if (this.policyId <= 0) {
      return;
    }

    this.approveOpen = false;
    this.store.dispatch(
      approvePolicy({
        policyId: this.policyId,
      }),
    );
  }

  protected dismissApproval(): void {
    this.approveOpen = false;
  }

  protected openRejection(): void {
    this.store.dispatch(clearPoliciesError());
    this.rejectionForm.reset();
    this.rejectOpen = true;
  }

  protected submitRejection(): void {
    if (this.rejectionForm.invalid || this.policyId <= 0) {
      this.rejectionForm.markAllAsTouched();
      return;
    }

    const reason = this.rejectionForm.controls.reason.value.trim();

    if (!reason) {
      this.rejectionForm.controls.reason.setErrors({
        required: true,
      });
      return;
    }

    this.rejectOpen = false;

    this.store.dispatch(
      rejectPolicy({
        policyId: this.policyId,
        reason,
      }),
    );
  }

  protected dismissRejection(): void {
    this.rejectOpen = false;
    this.rejectionForm.reset();
  }

  protected reasonLength(): number {
    return this.rejectionForm.controls.reason.value.length;
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
