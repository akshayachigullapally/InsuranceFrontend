import { Action, createReducer, on } from '@ngrx/store';
import { PayoutResponse } from '../../dtos/financial/payout-response.dto';
import {
  clearPayoutsError,
  clearPayoutsFilters,
  clearSelectedPayout,
  createPayout,
  createPayoutFailure,
  createPayoutSuccess,
  loadMyPayouts,
  loadMyPayoutsFailure,
  loadMyPayoutsSuccess,
  loadPayout,
  loadPayoutFailure,
  loadPayouts,
  loadPayoutsFailure,
  loadPayoutsSuccess,
  loadPayoutSuccess,
  markPayoutFail,
  markPayoutFailFailure,
  markPayoutFailSuccess,
  markPayoutSuccess,
  markPayoutSuccessFailure,
  markPayoutSuccessSuccess,
  processPayout,
  processPayoutFailure,
  processPayoutSuccess,
  retryPayout,
  retryPayoutFailure,
  retryPayoutSuccess,
  setPayoutsSearch,
} from './payouts.actions';
import { initialPayoutsState, PayoutsState } from './payouts.state';

function upsert(
  payouts: PayoutResponse[],
  payout: PayoutResponse,
): PayoutResponse[] {
  return payouts.some(item => item.id === payout.id)
    ? payouts.map(item => (item.id === payout.id ? payout : item))
    : [payout, ...payouts];
}

export const payoutsReducer = createReducer(
  initialPayoutsState,

  on(loadPayouts, loadMyPayouts, (state): PayoutsState => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(
    loadPayoutsSuccess,
    loadMyPayoutsSuccess,
    (state, { payouts }): PayoutsState => ({
      ...state,
      payouts,
      isLoading: false,
    }),
  ),

  on(
    loadPayoutsFailure,
    loadMyPayoutsFailure,
    (state, { error }): PayoutsState => ({
      ...state,
      isLoading: false,
      error,
    }),
  ),

  on(loadPayout, (state): PayoutsState => ({
    ...state,
    selectedPayout: null,
    isLoading: true,
    error: null,
  })),

  on(loadPayoutSuccess, (state, { payout }): PayoutsState => ({
    ...state,
    selectedPayout: payout,
    payouts: state.payouts.length
      ? upsert(state.payouts, payout)
      : state.payouts,
    isLoading: false,
  })),

  on(loadPayoutFailure, (state, { error }): PayoutsState => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(createPayout, (state): PayoutsState => ({
    ...state,
    isSaving: true,
    error: null,
  })),

  on(
    processPayout,
    markPayoutSuccess,
    markPayoutFail,
    retryPayout,
    (state): PayoutsState => ({
      ...state,
      isSaving: true,
      error: null,
    }),
  ),

  on(createPayoutSuccess, (state, { payout }): PayoutsState => ({
    ...state,
    payouts: upsert(state.payouts, payout),
    selectedPayout: payout,
    isSaving: false,
  })),

  on(
    processPayoutSuccess,
    markPayoutSuccessSuccess,
    markPayoutFailSuccess,
    retryPayoutSuccess,
    (state, { payout }): PayoutsState => ({
      ...state,
      payouts: upsert(state.payouts, payout),
      selectedPayout:
        state.selectedPayout?.id === payout.id
          ? payout
          : state.selectedPayout,
      isSaving: false,
    }),
  ),

  on(
    createPayoutFailure,
    processPayoutFailure,
    markPayoutSuccessFailure,
    markPayoutFailFailure,
    retryPayoutFailure,
    (state, { error }): PayoutsState => ({
      ...state,
      isSaving: false,
      error,
    }),
  ),

  on(setPayoutsSearch, (state, { search }): PayoutsState => ({
    ...state,
    search,
  })),

  on(clearPayoutsFilters, (state): PayoutsState => ({
    ...state,
    search: '',
  })),

  on(clearSelectedPayout, (state): PayoutsState => ({
    ...state,
    selectedPayout: null,
  })),

  on(clearPayoutsError, (state): PayoutsState => ({
    ...state,
    error: null,
  })),
);

export function reducer(
  state: PayoutsState | undefined,
  action: Action,
): PayoutsState {
  return payoutsReducer(state, action);
}
