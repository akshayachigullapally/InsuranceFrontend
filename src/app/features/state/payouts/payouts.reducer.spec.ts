import { payoutsReducer } from './payouts.reducer';
import { initialPayoutsState, PayoutsState } from './payouts.state';
import * as PayoutsActions from './payouts.actions';
import { PayoutResponse } from '../../dtos/financial/payout-response.dto';

function makePayout(id: number, status: PayoutResponse['status'] = 'PENDING'): PayoutResponse {
  return { id, payoutReference: `PAY-${id}`, status } as PayoutResponse;
}

describe('payoutsReducer', () => {
  it('returns the initial state for an unknown action', () => {
    expect(payoutsReducer(undefined, { type: '[Unknown]' } as never)).toEqual(initialPayoutsState);
  });

  it('loads payouts', () => {
    const loading = payoutsReducer(initialPayoutsState, PayoutsActions.loadMyPayouts());
    expect(loading.isLoading).toBe(true);

    const loaded = payoutsReducer(loading, PayoutsActions.loadMyPayoutsSuccess({ payouts: [makePayout(1)] }));
    expect(loaded.payouts.length).toBe(1);
    expect(loaded.isLoading).toBe(false);
  });

  it('stores load failures', () => {
    const state = payoutsReducer(initialPayoutsState, PayoutsActions.loadPayoutsFailure({ error: 'Forbidden' }));

    expect(state.error).toBe('Forbidden');
  });

  it('replaces a retried payout and the selected payout', () => {
    const current: PayoutsState = { ...initialPayoutsState, payouts: [makePayout(1)], selectedPayout: makePayout(1) };
    const paid = makePayout(1, 'SUCCESS');

    const state = payoutsReducer(current, PayoutsActions.retryPayoutSuccess({ payout: paid }));

    expect(state.payouts[0].status).toBe('SUCCESS');
    expect(state.selectedPayout).toEqual(paid);
  });

  it('sets isSaving for payout actions and clears it on failure', () => {
    const saving = payoutsReducer(
      initialPayoutsState,
      PayoutsActions.retryPayout({ payoutId: 1, request: { externalReference: '' } as never }),
    );
    expect(saving.isSaving).toBe(true);

    const failed = payoutsReducer(saving, PayoutsActions.retryPayoutFailure({ error: 'Retry limit reached' }));
    expect(failed.isSaving).toBe(false);
    expect(failed.error).toBe('Retry limit reached');
  });

  it('sets the search and clears the error', () => {
    const searched = payoutsReducer(initialPayoutsState, PayoutsActions.setPayoutsSearch({ search: 'clm' }));
    expect(searched.search).toBe('clm');

    expect(payoutsReducer({ ...searched, error: 'x' }, PayoutsActions.clearPayoutsError()).error).toBeNull();
  });
});
