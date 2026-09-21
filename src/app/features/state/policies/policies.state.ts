import {
  PolicyResponse,
  PolicyStatus,
} from '../../dtos/policies/policy-response.dto';

export interface PoliciesState {
  myPolicies: PolicyResponse[];
  selectedPolicy: PolicyResponse | null;
  reviewPolicies: PolicyResponse[];
  adminPolicies: PolicyResponse[];
  myPoliciesStatus: PolicyStatus | null;
  adminPoliciesStatus: PolicyStatus | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export const initialPoliciesState: PoliciesState = {
  myPolicies: [],
  selectedPolicy: null,
  reviewPolicies: [],
  adminPolicies: [],
  myPoliciesStatus: null,
  adminPoliciesStatus: null,
  isLoading: false,
  isSaving: false,
  error: null,
};