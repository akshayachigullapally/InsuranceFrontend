import { payoutsReducer } from './payouts.reducer';
import { initialPayoutsState } from './payouts.state';
import * as PayoutsActions from './payouts.actions';


describe('payoutsReducer', () => {
  it('returns the initial state for an unknown action', () => {
    expect(payoutsReducer(undefined, { type: '[Unknown]' } as never)).toEqual(initialPayoutsState);
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
});
