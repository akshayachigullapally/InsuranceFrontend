import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PaymentsState } from './payments.state';

const selectPaymentsState = createFeatureSelector<PaymentsState>('payments');

export const selectPayments = createSelector(selectPaymentsState, (state) => state.payments);

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

/** Sum of the customer's completed premium payments. */
export const selectTotalPremiumsPaid = createSelector(selectPayments, (payments) =>
  payments
    .filter((payment) => payment.status === 'SUCCESS')
    .reduce((total, payment) => total + Number(payment.amount ?? 0), 0),
);
