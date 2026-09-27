import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  takeUntil,
} from 'rxjs/operators';
import { CreateClaimRequest } from '../../dtos/claims/claim-response.dto';
import {
  PolicyResponse,
  PolicyTriggerSnapshotResponse,
} from '../../dtos/policies/policy-response.dto';
import { TriggerCondition } from '../../dtos/triggers/trigger-condition.dto';
import {
  clearClaimsError,
  createClaim,
} from '../../state/claims/claims.actions';
import {
  selectClaimsError,
  selectClaimsSaving,
} from '../../state/claims/claims.selectors';
import {
  clearPoliciesError,
  loadMyPolicies,
} from '../../state/policies/policies.actions';
import {
  selectMyPolicies,
  selectPoliciesError,
  selectPoliciesLoading,
} from '../../state/policies/policies.selectors';
import { PolicyService } from '../../services/policy.service';
import { ZoneService } from '../../services/zone.service';
import { parseLocalDateOnly } from '../../utils/local-date.util';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ParametricTriggerCardComponent } from '../../../shared/components/parametric-trigger-card/parametric-trigger-card.component';

interface ClaimForm {
  policyId: FormControl<number | null>;
  incidentType: FormControl<string>;
  incidentDate: FormControl<string>;
  incidentLocation: FormControl<string>;
  description: FormControl<string>;
  claimedAmount: FormControl<number | null>;
}

@Component({
  selector: 'app-customer-claim-new',
  standalone: true,
  imports: [
    AsyncPipe,
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    ParametricTriggerCardComponent,
  ],
  providers: [DatePipe],
  templateUrl: './customer-claim-new.component.html',
  styleUrl: './customer-claim-new.component.css',
})
export class CustomerClaimNewComponent implements OnInit, OnDestroy {
  readonly form = new FormGroup<ClaimForm>({
    policyId: new FormControl<number | null>(
      null,
      Validators.required,
    ),
    incidentType: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/\S+/),
      ],
    }),
    incidentDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    incidentLocation: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(250),
        Validators.pattern(/\S+/),
      ],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000),
        Validators.pattern(/\S+/),
      ],
    }),
    claimedAmount: new FormControl<number | null>(
      null,
      [
        Validators.required,
        Validators.min(0.01),
      ],
    ),
  });

  readonly policies$: Observable<PolicyResponse[]>;
  readonly policiesLoading$: Observable<boolean>;
  readonly policiesError$: Observable<string | null>;
  readonly submitting$: Observable<boolean>;
  readonly submitError$: Observable<string | null>;

  protected selectedPolicy: PolicyResponse | null = null;
  protected readonly maximumIncidentDate =
    CustomerClaimNewComponent.today();
  protected descriptionLength = 0;
  protected snapshot: PolicyTriggerSnapshotResponse | null = null;
  protected snapshotLoading = false;

  private policies: PolicyResponse[] = [];
  private requestedPolicyId: number | null = null;
  private zoneNamesById: Record<number, string> = {};
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store,
    private readonly datePipe: DatePipe,
    private readonly zoneService: ZoneService,
    private readonly policyService: PolicyService,
  ) {
    this.policies$ = this.store.select(selectMyPolicies);
    this.policiesLoading$ = this.store.select(selectPoliciesLoading);
    this.policiesError$ = this.store.select(selectPoliciesError);
    this.submitting$ = this.store.select(selectClaimsSaving);
    this.submitError$ = this.store.select(selectClaimsError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearPoliciesError());
    this.store.dispatch(clearClaimsError());
    this.store.dispatch(loadMyPolicies({
      status: 'ACTIVE',
    }));

    this.zoneService
      .getActiveZones()
      .pipe(takeUntil(this.destroy$))
      .subscribe(zones => {
        this.zoneNamesById = zones.reduce(
          (map, zone) => ({ ...map, [zone.id]: zone.zoneName }),
          {} as Record<number, string>,
        );
      });

    const policyId = Number(
      this.route.snapshot.queryParamMap.get('policyId'),
    );

    this.requestedPolicyId =
      Number.isInteger(policyId) && policyId > 0
        ? policyId
        : null;

    // Listen for policy changes before the store emits, so a policy preselected
    // from ?policyId= (with policies already cached) still applies its limits.
    this.form.controls.policyId.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe(selectedPolicyId => {
        this.updateSelectedPolicy(selectedPolicyId);
      });

    this.policies$
      .pipe(takeUntil(this.destroy$))
      .subscribe(policies => {
        this.policies = policies;
        this.selectRequestedPolicy();
      });

    this.form.controls.description.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(description => {
        this.descriptionLength = description.length;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearClaimsError());
  }

  protected onSubmit(): void {
    if (this.form.invalid || !this.selectedPolicy) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (
      raw.policyId === null ||
      raw.claimedAmount === null
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const incidentDate = new Date(
      `${raw.incidentDate}T00:00:00`,
    );

    if (incidentDate > new Date()) {
      this.form.controls.incidentDate.setErrors({
        futureDate: true,
      });
      return;
    }

    const description = raw.description.trim();

    const request: CreateClaimRequest = {
      policyId: raw.policyId,
      incidentType:
        raw.incidentType.trim().toUpperCase(),
      incidentDate: raw.incidentDate,
      incidentLocation: raw.incidentLocation.trim(),
      description,
      claimedAmount: raw.claimedAmount,
      claimSource: 'MANUAL_EXCEPTION',
      customerConfirmedLoss: true,
      evidenceDescription: description,
    };

    this.store.dispatch(clearClaimsError());
    this.store.dispatch(createClaim({ request }));
  }

  protected zoneLabel(locationZoneId: number): string {
    const name = this.zoneNamesById[locationZoneId];

    return name
      ? `${name} (Zone #${locationZoneId})`
      : `Zone #${locationZoneId}`;
  }

  protected formatDateOnly(value?: string | null): string {
    const date = parseLocalDateOnly(value);

    return date
      ? this.datePipe.transform(date, 'mediumDate') ?? 'Not available'
      : 'Not available';
  }

  private selectRequestedPolicy(): void {
    if (
      !this.requestedPolicyId ||
      this.policies.length === 0 ||
      this.form.controls.policyId.value
    ) {
      return;
    }

    const policy = this.policies.find(
      item => item.id === this.requestedPolicyId,
    );

    if (policy) {
      this.form.controls.policyId.setValue(policy.id);
    }
  }

  private updateSelectedPolicy(
    policyId: number | null,
  ): void {
    this.selectedPolicy =
      this.policies.find(policy => policy.id === policyId) ??
      null;

    const amountControl = this.form.controls.claimedAmount;

    if (!this.selectedPolicy) {
      amountControl.reset();
      amountControl.setValidators([
        Validators.required,
        Validators.min(0.01),
      ]);
      amountControl.updateValueAndValidity();
      this.snapshot = null;
      this.snapshotLoading = false;
      return;
    }

    amountControl.setValidators([
      Validators.required,
      Validators.min(0.01),
      Validators.max(this.selectedPolicy.sumInsured),
    ]);

    amountControl.setValue(
      this.selectedPolicy.sumInsured,
    );

    amountControl.updateValueAndValidity();

    this.loadSnapshot(this.selectedPolicy);
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

  private static today(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(
      now.getMonth() + 1,
    ).padStart(2, '0');
    const day = String(
      now.getDate(),
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}