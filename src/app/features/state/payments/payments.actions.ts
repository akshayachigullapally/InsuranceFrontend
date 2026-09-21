import { createAction, props } from '@ngrx/store';
import {
  PaymentActionRequest,
  PaymentRequest,
  PaymentResponse,
} from '../../dtos/financial/payment-response.dto';

export const loadPayments = createAction('[Payments] Load Payments');

export const loadPaymentsSuccess = createAction(
  '[Payments] Load Payments Success',
  props<{ payments: PaymentResponse[] }>(),
);

export const loadPaymentsFailure = createAction(
  '[Payments] Load Payments Failure',
  props<{ error: string }>(),
);

export const loadMyPayments = createAction('[Payments] Load My Payments');

export const loadMyPaymentsSuccess = createAction(
  '[Payments] Load My Payments Success',
  props<{ payments: PaymentResponse[] }>(),
);

export const loadMyPaymentsFailure = createAction(
  '[Payments] Load My Payments Failure',
  props<{ error: string }>(),
);

export const loadPayment = createAction(
  '[Payments] Load Payment',
  props<{ paymentId: number }>(),
);

export const loadPaymentSuccess = createAction(
  '[Payments] Load Payment Success',
  props<{ payment: PaymentResponse }>(),
);

export const loadPaymentFailure = createAction(
  '[Payments] Load Payment Failure',
  props<{ error: string }>(),
);

export const createPayment = createAction(
  '[Payments] Create Payment',
  props<{ request: PaymentRequest }>(),
);

export const createPaymentSuccess = createAction(
  '[Payments] Create Payment Success',
  props<{ payment: PaymentResponse }>(),
);

export const createPaymentFailure = createAction(
  '[Payments] Create Payment Failure',
  props<{ error: string }>(),
);

export const markPaymentSuccess = createAction(
  '[Payments] Mark Payment Success',
  props<{ paymentId: number; request: PaymentActionRequest }>(),
);

export const markPaymentSuccessSuccess = createAction(
  '[Payments] Mark Payment Success Success',
  props<{ payment: PaymentResponse }>(),
);

export const markPaymentSuccessFailure = createAction(
  '[Payments] Mark Payment Success Failure',
  props<{ error: string }>(),
);

export const markPaymentFail = createAction(
  '[Payments] Mark Payment Fail',
  props<{ paymentId: number; request: PaymentActionRequest }>(),
);

export const markPaymentFailSuccess = createAction(
  '[Payments] Mark Payment Fail Success',
  props<{ payment: PaymentResponse }>(),
);

export const markPaymentFailFailure = createAction(
  '[Payments] Mark Payment Fail Failure',
  props<{ error: string }>(),
);

export const refundPayment = createAction(
  '[Payments] Refund Payment',
  props<{ paymentId: number }>(),
);

export const refundPaymentSuccess = createAction(
  '[Payments] Refund Payment Success',
  props<{ paymentId: number }>(),
);

export const refundPaymentFailure = createAction(
  '[Payments] Refund Payment Failure',
  props<{ error: string }>(),
);

export const setPaymentsSearch = createAction(
  '[Payments] Set Search',
  props<{ search: string }>(),
);

export const clearPaymentsFilters = createAction('[Payments] Clear Filters');
export const clearSelectedPayment = createAction(
  '[Payments] Clear Selected Payment',
);
export const clearPaymentsError = createAction('[Payments] Clear Error');
