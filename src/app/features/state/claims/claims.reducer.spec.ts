import { claimsReducer } from './claims.reducer';
import { ClaimsState, initialClaimsState } from './claims.state';
import * as ClaimsActions from './claims.actions';
import { ClaimResponse } from '../../dtos/claims/claim-response.dto';

function makeClaim(id: number, overrides: Partial<ClaimResponse> = {}): ClaimResponse {
  return {
    id,
    claimNumber: `CLM-${id}`,
    customerId: 7,
    policyId: 3,
    policyNumber: 'POL-3',
    productId: 1,
    locationZoneId: 2,
    incidentType: 'EXCESS_RAINFALL',
    incidentDate: '2026-09-20',
    incidentLocation: 'Gachibowli',
    description: 'Crop damage',
    claimedAmount: 1000 * id,
    approvedAmount: null,
    status: 'SUBMITTED',
    submittedAt: '2026-09-21T10:00:00',
    updatedAt: '2026-09-21T10:00:00',
    ...overrides,
  };
}

describe('claimsReducer', () => {
  it('returns the initial state for an unknown action', () => {
    expect(claimsReducer(undefined, { type: '[Unknown]' } as never)).toEqual(initialClaimsState);
  });

  it('remembers the status filter and starts loading my claims', () => {
    const state = claimsReducer(initialClaimsState, ClaimsActions.loadMyClaims({ status: 'APPROVED' }));

    expect(state.myClaimsStatus).toBe('APPROVED');
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('stores my claims on success', () => {
    const claims = [makeClaim(1), makeClaim(2)];

    const state = claimsReducer(
      { ...initialClaimsState, isLoading: true },
      ClaimsActions.loadMyClaimsSuccess({ claims }),
    );

    expect(state.myClaims).toEqual(claims);
    expect(state.isLoading).toBe(false);
  });

  it('stores the error on failure', () => {
    const state = claimsReducer(
      { ...initialClaimsState, isLoading: true },
      ClaimsActions.loadMyClaimsFailure({ error: 'Server down' }),
    );

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Server down');
  });

  it('adds a newly created claim to the top of my claims', () => {
    const existing = makeClaim(1);
    const created = makeClaim(2);

    const state = claimsReducer(
      { ...initialClaimsState, myClaims: [existing], isSaving: true },
      ClaimsActions.createClaimSuccess({ claim: created }),
    );

    expect(state.myClaims.map((claim) => claim.id)).toEqual([2, 1]);
    expect(state.selectedClaim).toEqual(created);
    expect(state.isSaving).toBe(false);
  });

  it('removes a cancelled claim when the list is filtered to another status', () => {
    const current: ClaimsState = {
      ...initialClaimsState,
      myClaims: [makeClaim(1), makeClaim(2)],
      myClaimsStatus: 'SUBMITTED',
    };

    const state = claimsReducer(
      current,
      ClaimsActions.cancelClaimSuccess({ claim: makeClaim(1, { status: 'CANCELLED' }) }),
    );

    expect(state.myClaims.map((claim) => claim.id)).toEqual([2]);
  });

  it('removes a decided claim from the review queue and updates the selected claim', () => {
    const current: ClaimsState = {
      ...initialClaimsState,
      submittedClaims: [makeClaim(1), makeClaim(2)],
      selectedClaim: makeClaim(1),
      isSaving: true,
    };
    const approved = makeClaim(1, { status: 'APPROVED', approvedAmount: 900 });

    const state = claimsReducer(current, ClaimsActions.approveClaimSuccess({ claim: approved }));

    expect(state.submittedClaims.map((claim) => claim.id)).toEqual([2]);
    expect(state.selectedClaim).toEqual(approved);
    expect(state.isSaving).toBe(false);
  });

  it('replaces the selected claim when it is settled', () => {
    const current: ClaimsState = { ...initialClaimsState, selectedClaim: makeClaim(1), isSaving: true };
    const settled = makeClaim(1, { status: 'SETTLED' });

    const state = claimsReducer(current, ClaimsActions.settleClaimSuccess({ claim: settled }));

    expect(state.selectedClaim?.status).toBe('SETTLED');
    expect(state.isSaving).toBe(false);
  });

  it('sets isSaving for write actions and clears it on failure', () => {
    const saving = claimsReducer(initialClaimsState, ClaimsActions.rejectClaim({ claimId: 1, reason: 'No' }));
    expect(saving.isSaving).toBe(true);

    const failed = claimsReducer(saving, ClaimsActions.rejectClaimFailure({ error: 'Not allowed' }));
    expect(failed.isSaving).toBe(false);
    expect(failed.error).toBe('Not allowed');
  });

  it('clears the selected claim and the error', () => {
    const current: ClaimsState = { ...initialClaimsState, selectedClaim: makeClaim(1), error: 'Oops' };

    expect(claimsReducer(current, ClaimsActions.clearSelectedClaim()).selectedClaim).toBeNull();
    expect(claimsReducer(current, ClaimsActions.clearClaimsError()).error).toBeNull();
  });
});
