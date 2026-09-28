import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PaymentResponse } from '../../dtos/financial/payment-response.dto';
import {
  clearPaymentsError,
  loadPayments,
  markPaymentFail,
  markPaymentSuccess,
  refundPayment,
} from '../../state/payments/payments.actions';
import {
  selectPayments,
  selectPaymentsError,
  selectPaymentsLoading,
  selectPaymentsSaving,
} from '../../state/payments/payments.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './admin-payments.component.html',
})
export class AdminPaymentsComponent implements OnInit, OnDestroy {
  readonly payments$: Observable<PaymentResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly saving$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  constructor(private readonly store: Store) {
    this.payments$ = this.store.select(selectPayments);
    this.loading$ = this.store.select(selectPaymentsLoading);
    this.saving$ = this.store.select(selectPaymentsSaving);
    this.error$ = this.store.select(selectPaymentsError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearPaymentsError());
    this.store.dispatch(loadPayments());
  }

  ngOnDestroy(): void {
    this.store.dispatch(clearPaymentsError());
  }

  protected markSuccess(payment: PaymentResponse): void {
    this.store.dispatch(
      markPaymentSuccess({
        paymentId: payment.id,
        request: {
          externalReference: 'MOCK-TXN-' + Date.now(),
        },
      }),
    );
  }

  protected markFail(payment: PaymentResponse): void {
    const reason = window.prompt(
      `Reason the payment ${payment.paymentReference} failed:`,
      'Payment declined by processor',
    );

    if (reason === null) return;

    this.store.dispatch(
      markPaymentFail({
        paymentId: payment.id,
        request: {
          externalReference: '',
          failureReason: reason.trim() || 'Payment declined',
        },
      }),
    );
  }

  protected refund(payment: PaymentResponse): void {
    const confirmed = window.confirm(
      `Refund payment ${payment.paymentReference} for ₹${payment.amount}?`,
    );

    if (confirmed) {
      this.store.dispatch(refundPayment({ paymentId: payment.id }));
    }
  }
}
