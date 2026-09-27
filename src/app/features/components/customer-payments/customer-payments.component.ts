import { PayoutService } from '../../services/payout.service';
import { blobErrorMessage, saveBlob } from '../../utils/file-download.util';
import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, map } from 'rxjs';
import {
  PAYMENT_METHODS,
  PaymentMethod,
  PaymentRequest,
  PaymentResponse,
} from '../../dtos/financial/payment-response.dto';
import { PayoutResponse } from '../../dtos/financial/payout-response.dto';
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
import {
  clearPayoutsError,
  loadMyPayouts,
} from '../../state/payouts/payouts.actions';
import {
  selectPayouts,
  selectPayoutsError,
  selectPayoutsLoading,
} from '../../state/payouts/payouts.selectors';
import { loadMyPolicies } from '../../state/policies/policies.actions';
import { selectMyPolicies } from '../../state/policies/policies.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

type BillingTab = 'payments' | 'payouts';

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
  readonly payouts$: Observable<PayoutResponse[]>;
  readonly payoutsLoading$: Observable<boolean>;
  readonly payoutsError$: Observable<string | null>;
  readonly totalPaid$: Observable<number>;
  readonly totalReceived$: Observable<number>;

  protected readonly methods = PAYMENT_METHODS;
  protected formOpen = false;
  protected activeTab: BillingTab = 'payments';

  readonly form = new FormGroup<PaymentForm>({
    policyId: new FormControl<number | null>(null, Validators.required),
    method: new FormControl<PaymentMethod | null>(
      'MOCK_CARD',
      Validators.required,
    ),
  });

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly store: Store,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly payoutService: PayoutService,
  ) {
    this.payments$ = this.store.select(selectPayments);
    this.loading$ = this.store.select(selectPaymentsLoading);
    this.saving$ = this.store.select(selectPaymentsSaving);
    this.error$ = this.store.select(selectPaymentsError);
    this.policies$ = this.store.select(selectMyPolicies);
    this.payouts$ = this.store.select(selectPayouts);
    this.payoutsLoading$ = this.store.select(selectPayoutsLoading);
    this.payoutsError$ = this.store.select(selectPayoutsError);
    this.totalPaid$ = this.payments$.pipe(
      map(payments => sumAmounts(payments.filter(p => p.status === 'SUCCESS'))),
    );
    this.totalReceived$ = this.payouts$.pipe(
      map(payouts => sumAmounts(payouts.filter(p => p.status === 'SUCCESS'))),
    );
  }

  ngOnInit(): void {
    this.activeTab =
      this.route.snapshot.queryParamMap.get('tab') === 'payouts'
        ? 'payouts'
        : 'payments';
    this.store.dispatch(clearPaymentsError());
    this.store.dispatch(clearPayoutsError());
    this.store.dispatch(loadMyPayments());
    this.store.dispatch(loadMyPayouts());
    this.store.dispatch(loadMyPolicies({}));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearPaymentsError());
    this.store.dispatch(clearPayoutsError());
  }

  protected switchTab(tab: BillingTab): void {
    this.activeTab = tab;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab === 'payouts' ? 'payouts' : null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
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

  protected receiptBusyId: number | null = null;
  protected receiptError: string | null = null;

  protected downloadReceipt(payout: PayoutResponse): void {
    this.receiptBusyId = payout.id;
    this.receiptError = null;
    this.payoutService.downloadReceipt(payout.id).subscribe({
      next: blob => {
        this.receiptBusyId = null;
        saveBlob(blob, `${payout.payoutReference}-receipt.pdf`);
      },
      error: async (error: unknown) => {
        this.receiptBusyId = null;
        this.receiptError = await blobErrorMessage(error, 'Could not download the receipt.');
      },
    });
  }

}

function sumAmounts(items: { amount: number }[]): number {
  return items.reduce((total, item) => total + Number(item.amount ?? 0), 0);
}
