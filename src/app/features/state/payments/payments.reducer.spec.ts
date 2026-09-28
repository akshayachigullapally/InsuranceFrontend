import { paymentsReducer } from './payments.reducer';
import { initialPaymentsState, PaymentsState } from './payments.state';
import * as PaymentsActions from './payments.actions';
import { PaymentResponse } from '../../dtos/financial/payment-response.dto';

function makePayment(id: number, status: PaymentResponse['status'] = 'PENDING'): PaymentResponse {
  return { id, paymentReference: `PAYM-${id}`, status } as PaymentResponse;
}

describe('paymentsReducer', () => {
  it('returns the initial state for an unknown action', () => {
    expect(paymentsReducer(undefined, { type: '[Unknown]' } as never)).toEqual(initialPaymentsState);
  });

  it('loads my payments and all payments into the same list', () => {
    const mine = paymentsReducer(initialPaymentsState, PaymentsActions.loadMyPaymentsSuccess({ payments: [makePayment(1)] }));
    expect(mine.payments.length).toBe(1);

    const all = paymentsReducer(mine, PaymentsActions.loadPaymentsSuccess({ payments: [makePayment(1), makePayment(2)] }));
    expect(all.payments.length).toBe(2);
  });

  it('adds a created payment', () => {
    const state = paymentsReducer(initialPaymentsState, PaymentsActions.createPaymentSuccess({ payment: makePayment(3) }));

    expect(state.payments.map((payment) => payment.id)).toEqual([3]);
    expect(state.selectedPayment?.id).toBe(3);
  });

  it('marks a refunded payment as REFUNDED', () => {
    const current: PaymentsState = { ...initialPaymentsState, payments: [makePayment(1, 'SUCCESS')], selectedPayment: makePayment(1, 'SUCCESS') };

    const state = paymentsReducer(current, PaymentsActions.refundPaymentSuccess({ paymentId: 1 }));

    expect(state.payments[0].status).toBe('REFUNDED');
    expect(state.selectedPayment?.status).toBe('REFUNDED');
  });

  it('stores save failures', () => {
    const saving = paymentsReducer(initialPaymentsState, PaymentsActions.refundPayment({ paymentId: 1 }));
    expect(saving.isSaving).toBe(true);

    const failed = paymentsReducer(saving, PaymentsActions.refundPaymentFailure({ error: 'Too late' }));
    expect(failed.error).toBe('Too late');
    expect(failed.isSaving).toBe(false);
  });
});
