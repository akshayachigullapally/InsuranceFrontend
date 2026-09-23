import { Action, createReducer, on } from '@ngrx/store';
import {
  PolicyResponse,
  PolicyStatus,
} from '../../dtos/policies/policy-response.dto';
import {
  approvePolicy,
  approvePolicyFailure,
  approvePolicySuccess,
  cancelPolicy,
  cancelPolicyFailure,
  cancelPolicySuccess,
  clearPoliciesError,
  clearSelectedPolicy,
  createCustomPolicy,
  createPolicy,
  createPolicyFailure,
  createPolicySuccess,
  loadAdminPolicies,
  loadAdminPoliciesFailure,
  loadAdminPoliciesSuccess,
  loadAdminPolicy,
  loadAdminPolicyFailure,
  loadAdminPolicySuccess,
  loadMyPolicies,
  loadMyPoliciesFailure,
  loadMyPoliciesSuccess,
  loadMyPolicy,
  loadMyPolicyFailure,
  loadMyPolicySuccess,
  loadReviewPolicies,
  loadReviewPoliciesFailure,
  loadReviewPoliciesSuccess,
  rejectPolicy,
  rejectPolicyFailure,
  rejectPolicySuccess,
} from './policies.actions';
import {
  initialPoliciesState,
  PoliciesState,
} from './policies.state';

function upsert(
  policies: PolicyResponse[],
  policy: PolicyResponse,
): PolicyResponse[] {
  const exists = policies.some(item => item.id === policy.id);

  return exists
    ? policies.map(item => item.id === policy.id ? policy : item)
    : [policy, ...policies];
}

function updateExisting(
  policies: PolicyResponse[],
  policy: PolicyResponse,
): PolicyResponse[] {
  return policies.map(item =>
    item.id === policy.id ? policy : item,
  );
}

function matchesStatus(
  policy: PolicyResponse,
  status: PolicyStatus | null,
): boolean {
  return !status || policy.status === status;
}

function updateFilteredList(
  policies: PolicyResponse[],
  policy: PolicyResponse,
  status: PolicyStatus | null,
): PolicyResponse[] {
  if (!matchesStatus(policy, status)) {
    return policies.filter(item => item.id !== policy.id);
  }

  return upsert(policies, policy);
}

export const policiesReducer = createReducer(
  initialPoliciesState,

  on(
    loadMyPolicies,
    (state, { status }): PoliciesState => ({
      ...state,
      myPoliciesStatus: status ?? null,
      isLoading: true,
      error: null,
    }),
  ),

  on(
    loadMyPoliciesSuccess,
    (state, { policies }): PoliciesState => ({
      ...state,
      myPolicies: policies,
      isLoading: false,
    }),
  ),

  on(
    loadMyPoliciesFailure,
    (state, { error }): PoliciesState => ({
      ...state,
      isLoading: false,
      error,
    }),
  ),

  on(
    loadMyPolicy,
    (state): PoliciesState => ({
      ...state,
      selectedPolicy: null,
      isLoading: true,
      error: null,
    }),
  ),

  on(
    loadMyPolicySuccess,
    (state, { policy }): PoliciesState => ({
      ...state,
      selectedPolicy: policy,
      myPolicies: state.myPolicies.length
        ? updateExisting(state.myPolicies, policy)
        : state.myPolicies,
      isLoading: false,
    }),
  ),

  on(
    loadMyPolicyFailure,
    (state, { error }): PoliciesState => ({
      ...state,
      isLoading: false,
      error,
    }),
  ),

  on(
    loadReviewPolicies,
    (state): PoliciesState => ({
      ...state,
      isLoading: true,
      error: null,
    }),
  ),

  on(
    loadReviewPoliciesSuccess,
    (state, { policies }): PoliciesState => ({
      ...state,
      reviewPolicies: policies,
      isLoading: false,
    }),
  ),

  on(
    loadReviewPoliciesFailure,
    (state, { error }): PoliciesState => ({
      ...state,
      isLoading: false,
      error,
    }),
  ),

  on(
    loadAdminPolicies,
    (state, { status }): PoliciesState => ({
      ...state,
      adminPoliciesStatus: status ?? null,
      isLoading: true,
      error: null,
    }),
  ),

  on(
    loadAdminPoliciesSuccess,
    (state, { policies }): PoliciesState => ({
      ...state,
      adminPolicies: policies,
      isLoading: false,
    }),
  ),

  on(
    loadAdminPoliciesFailure,
    (state, { error }): PoliciesState => ({
      ...state,
      isLoading: false,
      error,
    }),
  ),

  on(
    loadAdminPolicy,
    (state): PoliciesState => ({
      ...state,
      selectedPolicy: null,
      isLoading: true,
      error: null,
    }),
  ),

  on(
    loadAdminPolicySuccess,
    (state, { policy }): PoliciesState => ({
      ...state,
      selectedPolicy: policy,
      adminPolicies: state.adminPolicies.length
        ? updateExisting(state.adminPolicies, policy)
        : state.adminPolicies,
      isLoading: false,
    }),
  ),

  on(
    loadAdminPolicyFailure,
    (state, { error }): PoliciesState => ({
      ...state,
      isLoading: false,
      error,
    }),
  ),

  on(
    createPolicy,
    createCustomPolicy,
    cancelPolicy,
    approvePolicy,
    rejectPolicy,
    (state): PoliciesState => ({
      ...state,
      isSaving: true,
      error: null,
    }),
  ),

  on(
    createPolicySuccess,
    (state, { policy }): PoliciesState => ({
      ...state,
      myPolicies: updateFilteredList(
        state.myPolicies,
        policy,
        state.myPoliciesStatus,
      ),
      selectedPolicy: policy,
      isSaving: false,
    }),
  ),

  on(
    cancelPolicySuccess,
    (state, { policy }): PoliciesState => ({
      ...state,
      myPolicies: updateFilteredList(
        state.myPolicies,
        policy,
        state.myPoliciesStatus,
      ),
      adminPolicies: state.adminPolicies.length
        ? updateFilteredList(
            state.adminPolicies,
            policy,
            state.adminPoliciesStatus,
          )
        : state.adminPolicies,
      selectedPolicy:
        state.selectedPolicy?.id === policy.id
          ? policy
          : state.selectedPolicy,
      isSaving: false,
    }),
  ),

  on(
    approvePolicySuccess,
    rejectPolicySuccess,
    (state, { policy }): PoliciesState => ({
      ...state,
      reviewPolicies: state.reviewPolicies.filter(
        item => item.id !== policy.id,
      ),
      adminPolicies: state.adminPolicies.length
        ? updateFilteredList(
            state.adminPolicies,
            policy,
            state.adminPoliciesStatus,
          )
        : state.adminPolicies,
      selectedPolicy:
        state.selectedPolicy?.id === policy.id
          ? policy
          : state.selectedPolicy,
      isSaving: false,
    }),
  ),

  on(
    createPolicyFailure,
    cancelPolicyFailure,
    approvePolicyFailure,
    rejectPolicyFailure,
    (state, { error }): PoliciesState => ({
      ...state,
      isSaving: false,
      error,
    }),
  ),

  on(
    clearPoliciesError,
    (state): PoliciesState => ({
      ...state,
      error: null,
    }),
  ),

  on(
    clearSelectedPolicy,
    (state): PoliciesState => ({
      ...state,
      selectedPolicy: null,
    }),
  ),
);

export function reducer(
  state: PoliciesState | undefined,
  action: Action,
): PoliciesState {
  return policiesReducer(state, action);
}