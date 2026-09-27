import { PaymentResponse } from '../../dtos/financial/payment-response.dto';
import {
  selectFailedPaymentCount,
  selectFilteredPayments,
  selectPendingPaymentCount,
  selectSuccessfulPaymentCount,
} from './payments.selectors';

function payment(id: number, status: PaymentResponse['status'], policyNumber: string): PaymentResponse {
  return { id, paymentReference: `PAYM-${id}`, policyNumber, status } as PaymentResponse;
}

describe('payments selectors', () => {
  const payments = [
    payment(1, 'PENDING', 'POL-0001'),
    payment(2, 'SUCCESS', 'POL-0002'),
    payment(3, 'FAILED', 'POL-0003'),
    payment(4, 'SUCCESS', 'POL-0001'),
  ];

  it('searches reference, policy number and status', () => {
    expect(selectFilteredPayments.projector(payments, '').length).toBe(4);
    expect(selectFilteredPayments.projector(payments, 'paym-3').map((p) => p.id)).toEqual([3]);
    expect(selectFilteredPayments.projector(payments, 'pol-0001').map((p) => p.id)).toEqual([1, 4]);
    expect(selectFilteredPayments.projector(payments, 'failed').map((p) => p.id)).toEqual([3]);
  });

  it('counts payments by status', () => {
    expect(selectPendingPaymentCount.projector(payments)).toBe(1);
    expect(selectSuccessfulPaymentCount.projector(payments)).toBe(2);
    expect(selectFailedPaymentCount.projector(payments)).toBe(1);
  });
});
