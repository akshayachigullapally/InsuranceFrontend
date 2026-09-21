import { createAction, props } from '@ngrx/store';
import {
  CreatePolicyRequest,
  PolicyResponse,
  PolicyStatus,
} from '../../dtos/policies/policy-response.dto';

export const loadMyPolicies = createAction(
  '[Policies] Load My Policies',
  props<{ status?: PolicyStatus }>(),
);

export const loadMyPoliciesSuccess = createAction(
  '[Policies] Load My Policies Success',
  props<{ policies: PolicyResponse[] }>(),
);

export const loadMyPoliciesFailure = createAction(
  '[Policies] Load My Policies Failure',
  props<{ error: string }>(),
);

export const loadMyPolicy = createAction(
  '[Policies] Load My Policy',
  props<{ policyId: number }>(),
);

export const loadMyPolicySuccess = createAction(
  '[Policies] Load My Policy Success',
  props<{ policy: PolicyResponse }>(),
);

export const loadMyPolicyFailure = createAction(
  '[Policies] Load My Policy Failure',
  props<{ error: string }>(),
);

export const createPolicy = createAction(
  '[Policies] Create Policy',
  props<{ request: CreatePolicyRequest }>(),
);

export const createPolicySuccess = createAction(
  '[Policies] Create Policy Success',
  props<{ policy: PolicyResponse }>(),
);

export const createPolicyFailure = createAction(
  '[Policies] Create Policy Failure',
  props<{ error: string }>(),
);

export const cancelPolicy = createAction(
  '[Policies] Cancel Policy',
  props<{ policyId: number }>(),
);

export const cancelPolicySuccess = createAction(
  '[Policies] Cancel Policy Success',
  props<{ policy: PolicyResponse }>(),
);

export const cancelPolicyFailure = createAction(
  '[Policies] Cancel Policy Failure',
  props<{ error: string }>(),
);

export const loadReviewPolicies = createAction(
  '[Policies] Load Review Policies',
);

export const loadReviewPoliciesSuccess = createAction(
  '[Policies] Load Review Policies Success',
  props<{ policies: PolicyResponse[] }>(),
);

export const loadReviewPoliciesFailure = createAction(
  '[Policies] Load Review Policies Failure',
  props<{ error: string }>(),
);

export const loadAdminPolicies = createAction(
  '[Policies] Load Admin Policies',
  props<{ status?: PolicyStatus }>(),
);

export const loadAdminPoliciesSuccess = createAction(
  '[Policies] Load Admin Policies Success',
  props<{ policies: PolicyResponse[] }>(),
);

export const loadAdminPoliciesFailure = createAction(
  '[Policies] Load Admin Policies Failure',
  props<{ error: string }>(),
);

export const loadAdminPolicy = createAction(
  '[Policies] Load Admin Policy',
  props<{ policyId: number }>(),
);

export const loadAdminPolicySuccess = createAction(
  '[Policies] Load Admin Policy Success',
  props<{ policy: PolicyResponse }>(),
);

export const loadAdminPolicyFailure = createAction(
  '[Policies] Load Admin Policy Failure',
  props<{ error: string }>(),
);

export const approvePolicy = createAction(
  '[Policies] Approve Policy',
  props<{ policyId: number }>(),
);

export const approvePolicySuccess = createAction(
  '[Policies] Approve Policy Success',
  props<{ policy: PolicyResponse }>(),
);

export const approvePolicyFailure = createAction(
  '[Policies] Approve Policy Failure',
  props<{ error: string }>(),
);

export const rejectPolicy = createAction(
  '[Policies] Reject Policy',
  props<{ policyId: number; reason: string }>(),
);

export const rejectPolicySuccess = createAction(
  '[Policies] Reject Policy Success',
  props<{ policy: PolicyResponse }>(),
);

export const rejectPolicyFailure = createAction(
  '[Policies] Reject Policy Failure',
  props<{ error: string }>(),
);

export const clearPoliciesError = createAction(
  '[Policies] Clear Error',
);

export const clearSelectedPolicy = createAction(
  '[Policies] Clear Selected Policy',
);