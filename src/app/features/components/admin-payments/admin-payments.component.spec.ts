import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { AdminPaymentsComponent } from './admin-payments.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import {
  clearPaymentsError,
  loadPayments,
  refundPayment,
} from '../../state/payments/payments.actions';
import { PaymentResponse } from '../../dtos/financial/payment-response.dto';

type PaymentsInternals = {
  refund(payment: PaymentResponse): void;
};

describe('AdminPaymentsComponent', () => {
  let fixture: ComponentFixture<AdminPaymentsComponent>;
  let page: PaymentsInternals;
  let store: MockStore;
  const payment = { id: 4, paymentReference: 'PAYM-4', amount: 1200 } as PaymentResponse;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPaymentsComponent],
      providers: pageTestProviders(),
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(AdminPaymentsComponent);
    page = fixture.componentInstance as unknown as PaymentsInternals;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads all payments on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(clearPaymentsError());
    expect(store.dispatch).toHaveBeenCalledWith(loadPayments());
  });

  it('refunds only after confirmation', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    page.refund(payment);
    expect(store.dispatch).not.toHaveBeenCalledWith(refundPayment({ paymentId: 4 }));

    confirm.mockReturnValue(true);
    page.refund(payment);
    expect(store.dispatch).toHaveBeenCalledWith(refundPayment({ paymentId: 4 }));
  });
});
