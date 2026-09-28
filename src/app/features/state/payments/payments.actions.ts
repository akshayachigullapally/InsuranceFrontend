import { createAction, props } from '@ngrx/store';
import {
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
