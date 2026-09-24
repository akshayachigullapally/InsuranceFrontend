import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import {
  PAYMENT_METHODS,
  PaymentMethod,
  PaymentRequest,
  PaymentResponse,
} from '../../dtos/financial/payment-response.dto';
import { PolicyResponse } from '../../dtos/policies/policy-response.dto';
import {
  clearPaymentsError,
  createPayment,
  loadMyPayments,
} from '../../state/payments/payments.actions';
import {
  selectPayments,
  selectPaymentsError,
  selectPaymentsLoading,
  selectPaymentsSaving,
} from '../../state/payments/payments.selectors';
import { loadMyPolicies } from '../../state/policies/policies.actions';
import { selectMyPolicies } from '../../state/policies/policies.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface PaymentForm {
  policyId: FormControl<number | null>;
  method: FormControl<PaymentMethod | null>;
}

@Component({
  selector: 'app-customer-payments',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './customer-payments.component.html',
  styleUrl: './customer-payments.component.css',
})
export class CustomerPaymentsComponent implements OnInit, OnDestroy {
  readonly payments$: Observable<PaymentResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly saving$: Observable<boolean>;
  readonly error$: Observable<string | null>;
  readonly policies$: Observable<PolicyResponse[]>;

  protected readonly methods = PAYMENT_METHODS;
  protected formOpen = false;

  readonly form = new FormGroup<PaymentForm>({
    policyId: new FormControl<number | null>(null, Validators.required),
    method: new FormControl<PaymentMethod | null>(
      'MOCK_CARD',
      Validators.required,
    ),
  });

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store) {
    this.payments$ = this.store.select(selectPayments);
    this.loading$ = this.store.select(selectPaymentsLoading);
    this.saving$ = this.store.select(selectPaymentsSaving);
    this.error$ = this.store.select(selectPaymentsError);
    this.policies$ = this.store.select(selectMyPolicies);
  }

  ngOnInit(): void {
    this.store.dispatch(clearPaymentsError());
    this.store.dispatch(loadMyPayments());
    this.store.dispatch(loadMyPolicies({}));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearPaymentsError());
  }

  protected openCreate(): void {
    this.store.dispatch(clearPaymentsError());
    this.form.reset({ policyId: null, method: 'MOCK_CARD' });
    this.formOpen = true;
  }

  protected closeForm(): void {
    this.formOpen = false;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (raw.policyId === null || raw.method === null) {
      this.form.markAllAsTouched();
      return;
    }

    const request: PaymentRequest = {
      policyId: raw.policyId,
      method: raw.method,
    };

    this.store.dispatch(createPayment({ request }));
    this.formOpen = false;
  }

  protected activePolicies(policies: PolicyResponse[]): PolicyResponse[] {
    return policies.filter(policy => policy.status === 'ACTIVE');
  }
}
