import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PoliciesState } from './policies.state';

const selectPoliciesState = createFeatureSelector<PoliciesState>('policies');

export const selectMyPolicies = createSelector(selectPoliciesState, (state) => state.myPolicies);

export const selectSelectedPolicy = createSelector(
  selectPoliciesState,
  (state) => state.selectedPolicy,
);

export const selectReviewPolicies = createSelector(
  selectPoliciesState,
  (state) => state.reviewPolicies,
);

export const selectAdminPolicies = createSelector(
  selectPoliciesState,
  (state) => state.adminPolicies,
);

export const selectPoliciesLoading = createSelector(
  selectPoliciesState,
  (state) => state.isLoading,
);

export const selectPoliciesSaving = createSelector(selectPoliciesState, (state) => state.isSaving);

export const selectPoliciesError = createSelector(selectPoliciesState, (state) => state.error);

export const selectActivePolicyCount = createSelector(
  selectMyPolicies,
  (policies) => policies.filter((policy) => policy.status === 'ACTIVE').length,
);

export const selectActiveSumInsured = createSelector(selectMyPolicies, (policies) =>
  policies
    .filter((policy) => policy.status === 'ACTIVE')
    .reduce((sum, policy) => sum + policy.sumInsured, 0),
);

export const selectPendingPolicyCount = createSelector(
  selectMyPolicies,
  (policies) => policies.filter((policy) => policy.status === 'PENDING').length,
);

export const selectPendingReviewCount = createSelector(
  selectReviewPolicies,
  (policies) => policies.filter((policy) => policy.status === 'PENDING').length,
);

export const selectAdminPendingPolicyCount = createSelector(
  selectAdminPolicies,
  (policies) => policies.filter((policy) => policy.status === 'PENDING').length,
);

export const selectAdminActivePolicyCount = createSelector(
  selectAdminPolicies,
  (policies) => policies.filter((policy) => policy.status === 'ACTIVE').length,
);

export const selectAdminActivePremium = createSelector(selectAdminPolicies, (policies) =>
  policies
    .filter((policy) => policy.status === 'ACTIVE')
    .reduce((sum, policy) => sum + policy.premiumAmount, 0),
);

export const selectAdminApprovedPolicyCount = createSelector(
  selectAdminPolicies,
  (policies) =>
    policies.filter((policy) => policy.status === 'ACTIVE' || policy.status === 'EXPIRED').length,
);

export const selectAdminRejectedPolicyCount = createSelector(
  selectAdminPolicies,
  (policies) => policies.filter((policy) => policy.status === 'REJECTED').length,
);
