import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PAYMENT_METHOD_LABELS, PaymentResponse } from '../../dtos/financial/payment-response.dto';
import {
  clearPaymentsError,
  loadPayments,
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

  protected readonly methodLabels = PAYMENT_METHOD_LABELS;

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

  protected refund(payment: PaymentResponse): void {
    const confirmed = window.confirm(
      `Refund payment ${payment.paymentReference} for ₹${payment.amount}?`,
    );

    if (confirmed) {
      this.store.dispatch(refundPayment({ paymentId: payment.id }));
    }
  }
}
