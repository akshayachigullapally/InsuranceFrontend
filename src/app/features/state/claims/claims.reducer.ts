import { Action, createReducer, on } from '@ngrx/store';
import {
  ClaimResponse,
  ClaimStatus,
} from '../../dtos/claims/claim-response.dto';
import {
  approveClaim,
  approveClaimFailure,
  approveClaimSuccess,
  cancelClaim,
  cancelClaimFailure,
  cancelClaimSuccess,
  clearClaimsError,
  clearSelectedClaim,
  createClaim,
  createClaimFailure,
  createClaimSuccess,
  loadAdminClaim,
  loadAdminClaimFailure,
  loadAdminClaimSuccess,
  loadAdminClaims,
  loadAdminClaimsFailure,
  loadAdminClaimsSuccess,
  loadMyClaim,
  loadMyClaimFailure,
  loadMyClaimSuccess,
  loadMyClaims,
  loadMyClaimsFailure,
  loadMyClaimsSuccess,
  loadReviewClaim,
  loadReviewClaimFailure,
  loadReviewClaimSuccess,
  loadSubmittedClaims,
  loadSubmittedClaimsFailure,
  loadSubmittedClaimsSuccess,
  rejectClaim,
  rejectClaimFailure,
  rejectClaimSuccess,
  startClaimReview,
  startClaimReviewFailure,
  startClaimReviewSuccess,
} from './claims.actions';
import {
  ClaimsState,
  initialClaimsState,
} from './claims.state';

function upsert(
  claims: ClaimResponse[],
  claim: ClaimResponse,
): ClaimResponse[] {
  const exists = claims.some(item => item.id === claim.id);

  return exists
    ? claims.map(item =>
        item.id === claim.id ? claim : item,
      )
    : [claim, ...claims];
}

function updateExisting(
  claims: ClaimResponse[],
  claim: ClaimResponse,
): ClaimResponse[] {
  return claims.map(item =>
    item.id === claim.id ? claim : item,
  );
}

function updateFilteredClaims(
  claims: ClaimResponse[],
  claim: ClaimResponse,
  status: ClaimStatus | null,
): ClaimResponse[] {
  if (status && claim.status !== status) {
    return claims.filter(item => item.id !== claim.id);
  }

  return upsert(claims, claim);
}

export const claimsReducer = createReducer(
  initialClaimsState,

  on(
    loadMyClaims,
    (state, { status }): ClaimsState => ({
      ...state,
      myClaimsStatus: status ?? null,
      isLoading: true,
      error: null,
    }),
  ),

  on(
    loadMyClaimsSuccess,
    (state, { claims }): ClaimsState => ({
      ...state,
      myClaims: claims,
      isLoading: false,
    }),
  ),

  on(
    loadMyClaimsFailure,
    (state, { error }): ClaimsState => ({
      ...state,
      isLoading: false,
      error,
    }),
  ),

  on(
    loadSubmittedClaims,
    (state): ClaimsState => ({
      ...state,
      isLoading: true,
      error: null,
    }),
  ),

  on(
    loadSubmittedClaimsSuccess,
    (state, { claims }): ClaimsState => ({
      ...state,
      submittedClaims: claims,
      isLoading: false,
    }),
  ),

  on(
    loadSubmittedClaimsFailure,
    (state, { error }): ClaimsState => ({
      ...state,
      isLoading: false,
      error,
    }),
  ),

  on(
    loadAdminClaims,
    (state, { status }): ClaimsState => ({
      ...state,
      adminClaimsStatus: status ?? null,
      isLoading: true,
      error: null,
    }),
  ),

  on(
    loadAdminClaimsSuccess,
    (state, { claims }): ClaimsState => ({
      ...state,
      adminClaims: claims,
      isLoading: false,
    }),
  ),

  on(
    loadAdminClaimsFailure,
    (state, { error }): ClaimsState => ({
      ...state,
      isLoading: false,
      error,
    }),
  ),

  on(
    loadMyClaim,
    loadReviewClaim,
    loadAdminClaim,
    (state): ClaimsState => ({
      ...state,
      selectedClaim: null,
      isLoading: true,
      error: null,
    }),
  ),

  on(
    loadMyClaimSuccess,
    (state, { claim }): ClaimsState => ({
      ...state,
      selectedClaim: claim,
      myClaims: state.myClaims.length
        ? updateExisting(state.myClaims, claim)
        : state.myClaims,
      isLoading: false,
    }),
  ),

  on(
    loadReviewClaimSuccess,
    (state, { claim }): ClaimsState => ({
      ...state,
      selectedClaim: claim,
      submittedClaims:
        claim.status === 'SUBMITTED'
          ? upsert(state.submittedClaims, claim)
          : state.submittedClaims.filter(
              item => item.id !== claim.id,
            ),
      isLoading: false,
    }),
  ),

  on(
    loadAdminClaimSuccess,
    (state, { claim }): ClaimsState => ({
      ...state,
      selectedClaim: claim,
      adminClaims: state.adminClaims.length
        ? updateExisting(state.adminClaims, claim)
        : state.adminClaims,
      isLoading: false,
    }),
  ),

  on(
    loadMyClaimFailure,
    loadReviewClaimFailure,
    loadAdminClaimFailure,
    (state, { error }): ClaimsState => ({
      ...state,
      isLoading: false,
      error,
    }),
  ),

  on(
    createClaim,
    cancelClaim,
    startClaimReview,
    approveClaim,
    rejectClaim,
    (state): ClaimsState => ({
      ...state,
      isSaving: true,
      error: null,
    }),
  ),

  on(
    createClaimSuccess,
    (state, { claim }): ClaimsState => ({
      ...state,
      myClaims: updateFilteredClaims(
        state.myClaims,
        claim,
        state.myClaimsStatus,
      ),
      selectedClaim: claim,
      isSaving: false,
    }),
  ),

  on(
    cancelClaimSuccess,
    (state, { claim }): ClaimsState => ({
      ...state,
      myClaims: updateFilteredClaims(
        state.myClaims,
        claim,
        state.myClaimsStatus,
      ),
      adminClaims: state.adminClaims.length
        ? updateFilteredClaims(
            state.adminClaims,
            claim,
            state.adminClaimsStatus,
          )
        : state.adminClaims,
      selectedClaim:
        state.selectedClaim?.id === claim.id
          ? claim
          : state.selectedClaim,
      isSaving: false,
    }),
  ),

  on(
    startClaimReviewSuccess,
    (state, { claim }): ClaimsState => ({
      ...state,
      submittedClaims: state.submittedClaims.filter(
        item => item.id !== claim.id,
      ),
      adminClaims: state.adminClaims.length
        ? updateFilteredClaims(
            state.adminClaims,
            claim,
            state.adminClaimsStatus,
          )
        : state.adminClaims,
      selectedClaim: claim,
      isSaving: false,
    }),
  ),

  on(
    approveClaimSuccess,
    rejectClaimSuccess,
    (state, { claim }): ClaimsState => ({
      ...state,
      submittedClaims: state.submittedClaims.filter(
        item => item.id !== claim.id,
      ),
      adminClaims: state.adminClaims.length
        ? updateFilteredClaims(
            state.adminClaims,
            claim,
            state.adminClaimsStatus,
          )
        : state.adminClaims,
      selectedClaim:
        state.selectedClaim?.id === claim.id
          ? claim
          : state.selectedClaim,
      isSaving: false,
    }),
  ),

  on(
    createClaimFailure,
    cancelClaimFailure,
    startClaimReviewFailure,
    approveClaimFailure,
    rejectClaimFailure,
    (state, { error }): ClaimsState => ({
      ...state,
      isSaving: false,
      error,
    }),
  ),

  on(
    clearSelectedClaim,
    (state): ClaimsState => ({
      ...state,
      selectedClaim: null,
    }),
  ),

  on(
    clearClaimsError,
    (state): ClaimsState => ({
      ...state,
      error: null,
    }),
  ),
);

export function reducer(
  state: ClaimsState | undefined,
  action: Action,
): ClaimsState {
  return claimsReducer(state, action);
}