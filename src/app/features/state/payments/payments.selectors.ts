import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PaymentsState } from './payments.state';

const selectPaymentsState = createFeatureSelector<PaymentsState>('payments');

export const selectPayments = createSelector(selectPaymentsState, (state) => state.payments);

const selectPaymentsSearch = createSelector(selectPaymentsState, (state) => state.search);

export const selectPaymentsLoading = createSelector(
  selectPaymentsState,
  (state) => state.isLoading,
);

export const selectPaymentsSaving = createSelector(selectPaymentsState, (state) => state.isSaving);

export const selectPaymentsError = createSelector(selectPaymentsState, (state) => state.error);

export const selectPaymentsLoaded = createSelector(selectPaymentsState, (state) => state.loaded);

/**
 * Key identifying one policy for payment matching. Policy ids can be reused when the
 * policy database is recreated, so the (unique) policy number is part of the key.
 */
export function paidPolicyKey(policy: { id?: number | null; policyId?: number | null; policyNumber?: string | null }): string {
  return `${policy.policyId ?? policy.id}|${policy.policyNumber ?? ''}`;
}

/** Policies whose premium has a successful payment, as {@link paidPolicyKey} keys. */
export const selectPaidPolicyKeys = createSelector(
  selectPayments,
  (payments) =>
    new Set(payments.filter((payment) => payment.status === 'SUCCESS').map((p) => paidPolicyKey(p))),
);

/** Saving flag, error and latest payment read together, so they always agree. */
export const selectPaymentOutcome = createSelector(selectPaymentsState, (state) => ({
  saving: state.isSaving,
  error: state.error,
  payment: state.selectedPayment,
}));

export const selectFilteredPayments = createSelector(
  selectPayments,
  selectPaymentsSearch,
  (payments, search) => {
    const value = search.trim().toLowerCase();

    if (!value) return payments;

    return payments.filter(
      (payment) =>
        payment.paymentReference.toLowerCase().includes(value) ||
        payment.policyNumber.toLowerCase().includes(value) ||
        payment.status.toLowerCase().includes(value),
    );
  },
);

export const selectPendingPaymentCount = createSelector(
  selectPayments,
  (payments) => payments.filter((payment) => payment.status === 'PENDING').length,
);

export const selectSuccessfulPaymentCount = createSelector(
  selectPayments,
  (payments) => payments.filter((payment) => payment.status === 'SUCCESS').length,
);

export const selectFailedPaymentCount = createSelector(
  selectPayments,
  (payments) => payments.filter((payment) => payment.status === 'FAILED').length,
);

/** Sum of the customer's completed premium payments. */
export const selectTotalPremiumsPaid = createSelector(selectPayments, (payments) =>
  payments
    .filter((payment) => payment.status === 'SUCCESS')
    .reduce((total, payment) => total + Number(payment.amount ?? 0), 0),
);
