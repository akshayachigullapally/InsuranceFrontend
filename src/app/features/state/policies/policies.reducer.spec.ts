import { policiesReducer } from './policies.reducer';
import { initialPoliciesState, PoliciesState } from './policies.state';
import * as PoliciesActions from './policies.actions';
import { PolicyResponse } from '../../dtos/policies/policy-response.dto';

function makePolicy(id: number, status: PolicyResponse['status'] = 'PENDING'): PolicyResponse {
  return { id, policyNumber: `POL-${id}`, status, sumInsured: 100000, premiumAmount: 1000 } as PolicyResponse;
}

describe('policiesReducer', () => {
  it('returns the initial state for an unknown action', () => {
    expect(policiesReducer(undefined, { type: '[Unknown]' } as never)).toEqual(initialPoliciesState);
  });

  it('stores loaded policies and failures', () => {
    const policies = [makePolicy(1), makePolicy(2)];

    const loaded = policiesReducer(initialPoliciesState, PoliciesActions.loadMyPoliciesSuccess({ policies }));
    expect(loaded.myPolicies).toEqual(policies);
    expect(loaded.isLoading).toBe(false);

    const failed = policiesReducer(loaded, PoliciesActions.loadMyPoliciesFailure({ error: 'Timeout' }));
    expect(failed.error).toBe('Timeout');
  });

  it('updates an existing policy in my list when a single policy loads', () => {
    const current: PoliciesState = { ...initialPoliciesState, myPolicies: [makePolicy(1), makePolicy(2)] };
    const updated = makePolicy(2, 'ACTIVE');

    const state = policiesReducer(current, PoliciesActions.loadMyPolicySuccess({ policy: updated }));

    expect(state.selectedPolicy).toEqual(updated);
    expect(state.myPolicies[1].status).toBe('ACTIVE');
  });

  it('removes a reviewed policy from the underwriter queue', () => {
    const current: PoliciesState = {
      ...initialPoliciesState,
      reviewPolicies: [makePolicy(1), makePolicy(2)],
      isSaving: true,
    };

    const state = policiesReducer(current, PoliciesActions.approvePolicySuccess({ policy: makePolicy(1, 'ACTIVE') }));

    expect(state.reviewPolicies.map((policy) => policy.id)).toEqual([2]);
    expect(state.isSaving).toBe(false);
  });
});
