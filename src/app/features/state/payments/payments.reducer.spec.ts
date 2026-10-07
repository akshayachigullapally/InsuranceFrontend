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

  it('marks a refunded payment as REFUNDED', () => {
    const current: PaymentsState = { ...initialPaymentsState, payments: [makePayment(1, 'SUCCESS')], selectedPayment: makePayment(1, 'SUCCESS') };

    const state = paymentsReducer(current, PaymentsActions.refundPaymentSuccess({ paymentId: 1 }));

    expect(state.payments[0].status).toBe('REFUNDED');
    expect(state.selectedPayment?.status).toBe('REFUNDED');
  });
});
