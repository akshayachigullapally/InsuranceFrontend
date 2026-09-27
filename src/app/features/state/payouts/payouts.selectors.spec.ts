import { PayoutResponse } from '../../dtos/financial/payout-response.dto';
import {
  selectFailedPayoutCount,
  selectFilteredPayouts,
  selectPendingPayoutCount,
  selectProcessingPayoutCount,
  selectSuccessfulPayoutAmount,
  selectSuccessfulPayoutCount,
} from './payouts.selectors';

function payout(id: number, status: PayoutResponse['status'], amount: number, claimNumber: string): PayoutResponse {
  return { id, payoutReference: `PAY-${id}`, claimNumber, status, amount } as PayoutResponse;
}

describe('payouts selectors', () => {
  const payouts = [
    payout(1, 'PENDING', 1000, 'CLM-0001'),
    payout(2, 'PROCESSING', 2000, 'CLM-0002'),
    payout(3, 'SUCCESS', 3000, 'CLM-0003'),
    payout(4, 'SUCCESS', 4500, 'CLM-0004'),
    payout(5, 'FAILED', 500, 'CLM-0005'),
  ];

  it('searches reference, claim number and status', () => {
    expect(selectFilteredPayouts.projector(payouts, '').length).toBe(5);
    expect(selectFilteredPayouts.projector(payouts, 'pay-2').map((p) => p.id)).toEqual([2]);
    expect(selectFilteredPayouts.projector(payouts, 'clm-0005').map((p) => p.id)).toEqual([5]);
    expect(selectFilteredPayouts.projector(payouts, 'success').map((p) => p.id)).toEqual([3, 4]);
  });

  it('counts payouts by status', () => {
    expect(selectPendingPayoutCount.projector(payouts)).toBe(1);
    expect(selectProcessingPayoutCount.projector(payouts)).toBe(1);
    expect(selectSuccessfulPayoutCount.projector(payouts)).toBe(2);
    expect(selectFailedPayoutCount.projector(payouts)).toBe(1);
  });

  it('sums only successful payouts', () => {
    expect(selectSuccessfulPayoutAmount.projector(payouts)).toBe(7500);
    expect(selectSuccessfulPayoutAmount.projector([])).toBe(0);
  });
});
