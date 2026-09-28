import { PayoutService } from '../../services/payout.service';
import { blobErrorMessage, saveBlob } from '../../utils/file-download.util';
import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest, interval, map, startWith, takeUntil } from 'rxjs';
import {
  PAYMENT_METHOD_LABELS,
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
  selectPaidPolicyIds,
  selectPaymentsLoaded,
  selectPaymentsSaving,
  selectPaymentOutcome,
  selectTotalPremiumsPaid,
} from '../../state/payments/payments.selectors';
import { clearPayoutsError, loadMyPayouts } from '../../state/payouts/payouts.actions';
import {
  selectPayouts,
  selectPayoutsError,
  selectPayoutsLoading,
  selectTotalPayoutsReceived,
} from '../../state/payouts/payouts.selectors';
import { loadMyPolicies } from '../../state/policies/policies.actions';
import { selectMyPolicies } from '../../state/policies/policies.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PaymentCheckoutComponent } from '../payment-checkout/payment-checkout.component';

type BillingTab = 'payments' | 'payouts';

const LIVE_REFRESH_MS = 15_000;

@Component({
  selector: 'app-customer-payments',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    PaymentCheckoutComponent,
  ],
  templateUrl: './customer-payments.component.html',
})
export class CustomerPaymentsComponent implements OnInit, OnDestroy {
  readonly payments$: Observable<PaymentResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly saving$: Observable<boolean>;
  readonly error$: Observable<string | null>;
  /** Active policies whose premium has not been paid yet. */
  readonly payablePolicies$: Observable<PolicyResponse[]>;
  readonly payouts$: Observable<PayoutResponse[]>;
  readonly payoutsLoading$: Observable<boolean>;
  readonly payoutsError$: Observable<string | null>;
  readonly totalPaid$: Observable<number>;
  readonly totalReceived$: Observable<number>;

  protected readonly methodLabels = PAYMENT_METHOD_LABELS;
  protected activeTab: BillingTab = 'payments';

  protected checkoutOpen = false;
  protected checkoutPolicyId: number | null = null;
  /** Set once the server has recorded the checkout's payment. */
  protected paidPayment: PaymentResponse | null = null;
  protected checkoutError: string | null = null;
  private awaitingPayment = false;

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
    this.payablePolicies$ = combineLatest([
      this.store.select(selectMyPolicies),
      this.store.select(selectPaidPolicyIds),
      this.store.select(selectPaymentsLoaded),
    ]).pipe(
      // Until payments have loaded we cannot tell paid from unpaid: offer nothing.
      map(([policies, paid, loaded]) =>
        loaded
          ? policies.filter((policy) => policy.status === 'ACTIVE' && !paid.has(policy.id))
          : [],
      ),
    );
    this.payouts$ = this.store.select(selectPayouts);
    this.payoutsLoading$ = this.store.select(selectPayoutsLoading);
    this.payoutsError$ = this.store.select(selectPayoutsError);
    this.totalPaid$ = this.store.select(selectTotalPremiumsPaid);
    this.totalReceived$ = this.store.select(selectTotalPayoutsReceived);
  }

  ngOnInit(): void {
    this.activeTab =
      this.route.snapshot.queryParamMap.get('tab') === 'payouts' ? 'payouts' : 'payments';
    this.store.dispatch(clearPaymentsError());
    this.store.dispatch(clearPayoutsError());
    this.store.dispatch(loadMyPolicies({}));

    // ?pay=<policyId> opens checkout for that policy straight away.
    const payPolicyId = Number(this.route.snapshot.queryParamMap.get('pay'));
    if (payPolicyId > 0) {
      this.openCheckout(payPolicyId);
    }

    this.store
      .select(selectPaymentOutcome)
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ saving, error, payment }) => {
        if (!this.awaitingPayment || saving) return;
        this.awaitingPayment = false;
        if (error && /already paid/i.test(error)) {
          // Paid elsewhere (another tab or an earlier attempt): refresh so the
          // policy moves to "Paid" everywhere instead of staying payable.
          this.checkoutError =
            'This policy is already paid. Your payments have been refreshed; it now shows as paid.';
          this.store.dispatch(loadMyPayments());
          this.store.dispatch(loadMyPolicies({}));
        } else if (error) {
          this.checkoutError = error;
        } else {
          this.paidPayment = payment;
        }
      });
    // Payments are confirmed and payouts completed after the fact:
    // refresh every 15 s so statuses and totals stay current.
    interval(LIVE_REFRESH_MS)
      .pipe(startWith(0))
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.store.dispatch(loadMyPayments());
        this.store.dispatch(loadMyPayouts());
      });
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

  protected openCheckout(policyId: number | null = null): void {
    this.store.dispatch(clearPaymentsError());
    this.checkoutPolicyId = policyId;
    this.paidPayment = null;
    this.checkoutError = null;
    this.checkoutOpen = true;
  }

  protected closeCheckout(): void {
    this.checkoutOpen = false;
    this.paidPayment = null;
    this.checkoutError = null;
    this.store.dispatch(clearPaymentsError());
    if (this.route.snapshot.queryParamMap.has('pay')) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { pay: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  protected pay(request: PaymentRequest): void {
    this.checkoutError = null;
    this.awaitingPayment = true;
    this.store.dispatch(createPayment({ request }));
  }

  protected receiptBusyId: number | null = null;
  protected receiptError: string | null = null;

  protected downloadReceipt(payout: PayoutResponse): void {
    this.receiptBusyId = payout.id;
    this.receiptError = null;
    this.payoutService.downloadReceipt(payout.id).subscribe({
      next: (blob) => {
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
