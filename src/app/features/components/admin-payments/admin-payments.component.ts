import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
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
import { DialogService } from '../../../shared/services/dialog.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { CustomerNamePipe } from '../../../shared/pipes/customer-name.pipe';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [
    CustomerNamePipe,
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

  private readonly dialog = inject(DialogService);

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

  protected async refund(payment: PaymentResponse): Promise<void> {
    const amount = payment.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    const confirmed = await this.dialog.confirm({
      title: `Refund ₹ ${amount}?`,
      message: `Payment ${payment.paymentReference} will be refunded to the customer.`,
      confirmLabel: 'Refund payment',
      danger: true,
    });

    if (confirmed) {
      this.store.dispatch(refundPayment({ paymentId: payment.id }));
    }
  }
}
