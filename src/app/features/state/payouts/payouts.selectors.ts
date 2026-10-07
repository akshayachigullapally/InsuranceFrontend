import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PayoutsState } from './payouts.state';

const selectPayoutsState = createFeatureSelector<PayoutsState>('payouts');

export const selectPayouts = createSelector(selectPayoutsState, (state) => state.payouts);

export const selectPayoutsLoading = createSelector(selectPayoutsState, (state) => state.isLoading);

export const selectPayoutsSaving = createSelector(selectPayoutsState, (state) => state.isSaving);

export const selectPayoutsError = createSelector(selectPayoutsState, (state) => state.error);

export const selectSuccessfulPayoutAmount = createSelector(selectPayouts, (payouts) =>
  payouts
    .filter((payout) => payout.status === 'SUCCESS')
    .reduce((sum, payout) => sum + payout.amount, 0),
);

/** Sum of completed claim payouts. */
export const selectTotalPayoutsReceived = createSelector(selectPayouts, (payouts) =>
  payouts
    .filter((payout) => payout.status === 'SUCCESS')
    .reduce((total, payout) => total + Number(payout.amount ?? 0), 0),
);
