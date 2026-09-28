import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ClaimsState } from './claims.state';

const selectClaimsState = createFeatureSelector<ClaimsState>('claims');

export const selectMyClaims = createSelector(selectClaimsState, (state) => state.myClaims);

export const selectSubmittedClaims = createSelector(
  selectClaimsState,
  (state) => state.submittedClaims,
);

export const selectAdminClaims = createSelector(selectClaimsState, (state) => state.adminClaims);

export const selectSelectedClaim = createSelector(
  selectClaimsState,
  (state) => state.selectedClaim,
);

export const selectClaimsLoading = createSelector(selectClaimsState, (state) => state.isLoading);

export const selectClaimsSaving = createSelector(selectClaimsState, (state) => state.isSaving);

export const selectClaimsError = createSelector(selectClaimsState, (state) => state.error);

export const selectMySubmittedClaimCount = createSelector(
  selectMyClaims,
  (claims) => claims.filter((claim) => claim.status === 'SUBMITTED').length,
);

export const selectMyApprovedClaimCount = createSelector(
  selectMyClaims,
  (claims) => claims.filter((claim) => claim.status === 'APPROVED').length,
);

export const selectMyApprovedAmount = createSelector(selectMyClaims, (claims) =>
  claims
    .filter((claim) => claim.status === 'APPROVED')
    .reduce((sum, claim) => sum + (claim.approvedAmount ?? 0), 0),
);

export const selectSubmittedReviewCount = createSelector(
  selectSubmittedClaims,
  (claims) => claims.length,
);

export const selectSubmittedClaimedAmount = createSelector(selectSubmittedClaims, (claims) =>
  claims.reduce((sum, claim) => sum + claim.claimedAmount, 0),
);

export const selectAdminSubmittedClaimCount = createSelector(
  selectAdminClaims,
  (claims) => claims.filter((claim) => claim.status === 'SUBMITTED').length,
);

export const selectAdminUnderReviewClaimCount = createSelector(
  selectAdminClaims,
  (claims) => claims.filter((claim) => claim.status === 'UNDER_REVIEW').length,
);

export const selectAdminApprovedClaimCount = createSelector(
  selectAdminClaims,
  (claims) => claims.filter((claim) => claim.status === 'APPROVED').length,
);

export const selectAdminApprovedAmount = createSelector(selectAdminClaims, (claims) =>
  claims.reduce((sum, claim) => sum + (claim.approvedAmount ?? 0), 0),
);
