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
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PolicyResponse } from '../../dtos/policies/policy-response.dto';
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
import { ZoneService } from '../../services/zone.service';
import { parseLocalDateOnly } from '../../utils/local-date.util';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
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
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    StatusBadgeComponent,
    ConfirmationDialogComponent,
  ],
  providers: [DatePipe],
  templateUrl: './underwriter-policy-detail.component.html',
  styleUrl: './underwriter-policy-detail.component.css',
})
export class UnderwriterPolicyDetailComponent implements OnInit, OnDestroy {
  readonly policy$: Observable<PolicyResponse | null>;
  readonly loading$: Observable<boolean>;
  readonly saving$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  readonly rejectionForm = new FormGroup<RejectionForm>({
    reason: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(500),
        Validators.pattern(/\S+/),
      ],
    }),
  });

  protected approveOpen = false;
  protected rejectOpen = false;
  protected invalidPolicyId = false;
  protected zoneName: string | null = null;

  private policyId = 0;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store,
    private readonly datePipe: DatePipe,
    private readonly zoneService: ZoneService,
  ) {
    this.policy$ = this.store.select(selectSelectedPolicy);
    this.loading$ = this.store.select(selectPoliciesLoading);
    this.saving$ = this.store.select(selectPoliciesSaving);
    this.error$ = this.store.select(selectPoliciesError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearPoliciesError());
    this.store.dispatch(clearSelectedPolicy());

    const policyId = Number(
      this.route.snapshot.paramMap.get('policyId'),
    );

    if (!Number.isInteger(policyId) || policyId <= 0) {
      this.invalidPolicyId = true;
      return;
    }

    this.policyId = policyId;
    this.store.dispatch(loadAdminPolicy({ policyId }));

    this.policy$
      .pipe(takeUntil(this.destroy$))
      .subscribe(policy => {
        if (!policy || policy.id !== policyId) {
          return;
        }

        this.loadZone(policy.locationZoneId);
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
        next: zone => {
          this.zoneName = zone.zoneName;
        },
        error: () => {
          this.zoneName = null;
        },
      });
  }

  protected details(policy: PolicyResponse): DetailRow[] {
    return [
      {
        label: 'Customer',
        value: `Customer #${policy.customerId}`,
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
        value: this.formatDateOnly(policy.startDate),
      },
      {
        label: 'Coverage end',
        value: this.formatDateOnly(policy.endDate),
      },
    ];
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
    this.store.dispatch(approvePolicy({
      policyId: this.policyId,
    }));
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

    const reason = this.rejectionForm.controls.reason
      .value
      .trim();

    if (!reason) {
      this.rejectionForm.controls.reason.setErrors({
        required: true,
      });
      return;
    }

    this.rejectOpen = false;

    this.store.dispatch(rejectPolicy({
      policyId: this.policyId,
      reason,
    }));
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

    return this.datePipe.transform(
      value,
      'medium',
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