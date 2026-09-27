import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PayoutsState } from './payouts.state';

const selectPayoutsState = createFeatureSelector<PayoutsState>('payouts');

export const selectPayouts = createSelector(
  selectPayoutsState,
  state => state.payouts,
);

export const selectSelectedPayout = createSelector(
  selectPayoutsState,
  state => state.selectedPayout,
);

export const selectPayoutsSearch = createSelector(
  selectPayoutsState,
  state => state.search,
);

export const selectPayoutsLoading = createSelector(
  selectPayoutsState,
  state => state.isLoading,
);

export const selectPayoutsSaving = createSelector(
  selectPayoutsState,
  state => state.isSaving,
);

export const selectPayoutsError = createSelector(
  selectPayoutsState,
  state => state.error,
);

export const selectFilteredPayouts = createSelector(
  selectPayouts,
  selectPayoutsSearch,
  (payouts, search) => {
    const value = search.trim().toLowerCase();

    if (!value) return payouts;

    return payouts.filter(
      payout =>
        payout.payoutReference.toLowerCase().includes(value) ||
        payout.claimNumber.toLowerCase().includes(value) ||
        payout.status.toLowerCase().includes(value),
    );
  },
);

export const selectPendingPayoutCount = createSelector(
  selectPayouts,
  payouts => payouts.filter(payout => payout.status === 'PENDING').length,
);

export const selectProcessingPayoutCount = createSelector(
  selectPayouts,
  payouts => payouts.filter(payout => payout.status === 'PROCESSING').length,
);

export const selectSuccessfulPayoutCount = createSelector(
  selectPayouts,
  payouts => payouts.filter(payout => payout.status === 'SUCCESS').length,
);

export const selectFailedPayoutCount = createSelector(
  selectPayouts,
  payouts => payouts.filter(payout => payout.status === 'FAILED').length,
);

export const selectSuccessfulPayoutAmount = createSelector(
  selectPayouts,
  payouts =>
    payouts
      .filter(payout => payout.status === 'SUCCESS')
      .reduce((sum, payout) => sum + payout.amount, 0),
);

/** Sum of completed claim payouts. */
export const selectTotalPayoutsReceived = createSelector(
  selectPayouts,
  payouts => payouts
    .filter(payout => payout.status === 'SUCCESS')
    .reduce((total, payout) => total + Number(payout.amount ?? 0), 0),
);
