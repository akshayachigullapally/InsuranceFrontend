import { selectTotalPremiumsPaid } from './payments.selectors';
import { PaymentResponse } from '../../dtos/financial/payment-response.dto';

describe('customer money totals', () => {
  it('sums only completed premium payments', () => {
    const payments = [
      { id: 1, amount: 1000, status: 'SUCCESS' },
      { id: 2, amount: 500, status: 'PENDING' },
      { id: 3, amount: 250.5, status: 'SUCCESS' },
      { id: 4, amount: 900, status: 'FAILED' },
    ] as PaymentResponse[];

    expect(selectTotalPremiumsPaid.projector(payments)).toBe(1250.5);
  });
});
