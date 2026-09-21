import { Action, createReducer, on } from '@ngrx/store';
import { PaymentResponse } from '../../dtos/financial/payment-response.dto';
import {
  clearPaymentsError,
  clearPaymentsFilters,
  clearSelectedPayment,
  createPayment,
  createPaymentFailure,
  createPaymentSuccess,
  loadMyPayments,
  loadMyPaymentsFailure,
  loadMyPaymentsSuccess,
  loadPayment,
  loadPaymentFailure,
  loadPayments,
  loadPaymentsFailure,
  loadPaymentsSuccess,
  loadPaymentSuccess,
  markPaymentFail,
  markPaymentFailFailure,
  markPaymentFailSuccess,
  markPaymentSuccess,
  markPaymentSuccessFailure,
  markPaymentSuccessSuccess,
  refundPayment,
  refundPaymentFailure,
  refundPaymentSuccess,
  setPaymentsSearch,
} from './payments.actions';
import { initialPaymentsState, PaymentsState } from './payments.state';

function upsert(
  payments: PaymentResponse[],
  payment: PaymentResponse,
): PaymentResponse[] {
  return payments.some(item => item.id === payment.id)
    ? payments.map(item => (item.id === payment.id ? payment : item))
    : [payment, ...payments];
}

export const paymentsReducer = createReducer(
  initialPaymentsState,

  on(loadPayments, loadMyPayments, (state): PaymentsState => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(
    loadPaymentsSuccess,
    loadMyPaymentsSuccess,
    (state, { payments }): PaymentsState => ({
      ...state,
      payments,
      isLoading: false,
    }),
  ),

  on(
    loadPaymentsFailure,
    loadMyPaymentsFailure,
    (state, { error }): PaymentsState => ({
      ...state,
      isLoading: false,
      error,
    }),
  ),

  on(loadPayment, (state): PaymentsState => ({
    ...state,
    selectedPayment: null,
    isLoading: true,
    error: null,
  })),

  on(loadPaymentSuccess, (state, { payment }): PaymentsState => ({
    ...state,
    selectedPayment: payment,
    payments: state.payments.length
      ? upsert(state.payments, payment)
      : state.payments,
    isLoading: false,
  })),

  on(loadPaymentFailure, (state, { error }): PaymentsState => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(createPayment, (state): PaymentsState => ({
    ...state,
    isSaving: true,
    error: null,
  })),

  on(
    markPaymentSuccess,
    markPaymentFail,
    refundPayment,
    (state): PaymentsState => ({
      ...state,
      isSaving: true,
      error: null,
    }),
  ),

  on(createPaymentSuccess, (state, { payment }): PaymentsState => ({
    ...state,
    payments: upsert(state.payments, payment),
    selectedPayment: payment,
    isSaving: false,
  })),

  on(
    markPaymentSuccessSuccess,
    markPaymentFailSuccess,
    (state, { payment }): PaymentsState => ({
      ...state,
      payments: upsert(state.payments, payment),
      selectedPayment:
        state.selectedPayment?.id === payment.id
          ? payment
          : state.selectedPayment,
      isSaving: false,
    }),
  ),

  on(refundPaymentSuccess, (state, { paymentId }): PaymentsState => ({
    ...state,
    payments: state.payments.map(p =>
      p.id === paymentId ? { ...p, status: 'REFUNDED' as const } : p,
    ),
    selectedPayment:
      state.selectedPayment?.id === paymentId
        ? { ...state.selectedPayment, status: 'REFUNDED' as const }
        : state.selectedPayment,
    isSaving: false,
  })),

  on(
    createPaymentFailure,
    markPaymentSuccessFailure,
    markPaymentFailFailure,
    refundPaymentFailure,
    (state, { error }): PaymentsState => ({
      ...state,
      isSaving: false,
      error,
    }),
  ),

  on(setPaymentsSearch, (state, { search }): PaymentsState => ({
    ...state,
    search,
  })),

  on(clearPaymentsFilters, (state): PaymentsState => ({
    ...state,
    search: '',
  })),

  on(clearSelectedPayment, (state): PaymentsState => ({
    ...state,
    selectedPayment: null,
  })),

  on(clearPaymentsError, (state): PaymentsState => ({
    ...state,
    error: null,
  })),
);

export function reducer(
  state: PaymentsState | undefined,
  action: Action,
): PaymentsState {
  return paymentsReducer(state, action);
}
