import { createAction, props } from '@ngrx/store';
import {
  CreatePayoutRequest,
  PayoutActionRequest,
  PayoutResponse,
} from '../../dtos/financial/payout-response.dto';

export const loadPayouts = createAction('[Payouts] Load Payouts');

export const loadPayoutsSuccess = createAction(
  '[Payouts] Load Payouts Success',
  props<{ payouts: PayoutResponse[] }>(),
);

export const loadPayoutsFailure = createAction(
  '[Payouts] Load Payouts Failure',
  props<{ error: string }>(),
);

export const loadMyPayouts = createAction('[Payouts] Load My Payouts');

export const loadMyPayoutsSuccess = createAction(
  '[Payouts] Load My Payouts Success',
  props<{ payouts: PayoutResponse[] }>(),
);

export const loadMyPayoutsFailure = createAction(
  '[Payouts] Load My Payouts Failure',
  props<{ error: string }>(),
);

export const loadPayout = createAction(
  '[Payouts] Load Payout',
  props<{ payoutId: number }>(),
);

export const loadPayoutSuccess = createAction(
  '[Payouts] Load Payout Success',
  props<{ payout: PayoutResponse }>(),
);

export const loadPayoutFailure = createAction(
  '[Payouts] Load Payout Failure',
  props<{ error: string }>(),
);

export const createPayout = createAction(
  '[Payouts] Create Payout',
  props<{ request: CreatePayoutRequest }>(),
);

export const createPayoutSuccess = createAction(
  '[Payouts] Create Payout Success',
  props<{ payout: PayoutResponse }>(),
);

export const createPayoutFailure = createAction(
  '[Payouts] Create Payout Failure',
  props<{ error: string }>(),
);

export const processPayout = createAction(
  '[Payouts] Process Payout',
  props<{ payoutId: number; request: PayoutActionRequest }>(),
);

export const processPayoutSuccess = createAction(
  '[Payouts] Process Payout Success',
  props<{ payout: PayoutResponse }>(),
);

export const processPayoutFailure = createAction(
  '[Payouts] Process Payout Failure',
  props<{ error: string }>(),
);

export const markPayoutSuccess = createAction(
  '[Payouts] Mark Payout Success',
  props<{ payoutId: number; request: PayoutActionRequest }>(),
);

export const markPayoutSuccessSuccess = createAction(
  '[Payouts] Mark Payout Success Success',
  props<{ payout: PayoutResponse }>(),
);

export const markPayoutSuccessFailure = createAction(
  '[Payouts] Mark Payout Success Failure',
  props<{ error: string }>(),
);

export const markPayoutFail = createAction(
  '[Payouts] Mark Payout Fail',
  props<{ payoutId: number; request: PayoutActionRequest }>(),
);

export const markPayoutFailSuccess = createAction(
  '[Payouts] Mark Payout Fail Success',
  props<{ payout: PayoutResponse }>(),
);

export const markPayoutFailFailure = createAction(
  '[Payouts] Mark Payout Fail Failure',
  props<{ error: string }>(),
);

export const retryPayout = createAction(
  '[Payouts] Retry Payout',
  props<{ payoutId: number; request: PayoutActionRequest }>(),
);

export const retryPayoutSuccess = createAction(
  '[Payouts] Retry Payout Success',
  props<{ payout: PayoutResponse }>(),
);

export const retryPayoutFailure = createAction(
  '[Payouts] Retry Payout Failure',
  props<{ error: string }>(),
);

export const setPayoutsSearch = createAction(
  '[Payouts] Set Search',
  props<{ search: string }>(),
);

export const clearPayoutsFilters = createAction('[Payouts] Clear Filters');
export const clearSelectedPayout = createAction(
  '[Payouts] Clear Selected Payout',
);
export const clearPayoutsError = createAction('[Payouts] Clear Error');
