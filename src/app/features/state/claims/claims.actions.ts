import { createAction, props } from '@ngrx/store';
import {
  ClaimResponse,
  ClaimStatus,
  CreateClaimRequest,
} from '../../dtos/claims/claim-response.dto';

export const loadMyClaims = createAction(
  '[Claims] Load My Claims',
  props<{ status?: ClaimStatus }>(),
);

export const loadMyClaimsSuccess = createAction(
  '[Claims] Load My Claims Success',
  props<{ claims: ClaimResponse[] }>(),
);

export const loadMyClaimsFailure = createAction(
  '[Claims] Load My Claims Failure',
  props<{ error: string }>(),
);

export const loadMyClaim = createAction(
  '[Claims] Load My Claim',
  props<{ claimId: number }>(),
);

export const loadMyClaimSuccess = createAction(
  '[Claims] Load My Claim Success',
  props<{ claim: ClaimResponse }>(),
);

export const loadMyClaimFailure = createAction(
  '[Claims] Load My Claim Failure',
  props<{ error: string }>(),
);

export const createClaim = createAction(
  '[Claims] Create Claim',
  props<{ request: CreateClaimRequest; files?: File[] }>(),
);

export const createClaimSuccess = createAction(
  '[Claims] Create Claim Success',
  props<{
    claim: ClaimResponse;
    /** True when evidence files were attached: the customer is taken to the claim page. */
    openClaim?: boolean;
    uploadError?: string | null;
  }>(),
);

export const createClaimFailure = createAction(
  '[Claims] Create Claim Failure',
  props<{ error: string }>(),
);

export const cancelClaim = createAction(
  '[Claims] Cancel Claim',
  props<{ claimId: number }>(),
);

export const cancelClaimSuccess = createAction(
  '[Claims] Cancel Claim Success',
  props<{ claim: ClaimResponse }>(),
);

export const cancelClaimFailure = createAction(
  '[Claims] Cancel Claim Failure',
  props<{ error: string }>(),
);

export const loadSubmittedClaims = createAction(
  '[Claims] Load Submitted Claims',
);

export const loadSubmittedClaimsSuccess = createAction(
  '[Claims] Load Submitted Claims Success',
  props<{ claims: ClaimResponse[] }>(),
);

export const loadSubmittedClaimsFailure = createAction(
  '[Claims] Load Submitted Claims Failure',
  props<{ error: string }>(),
);

export const loadReviewClaim = createAction(
  '[Claims] Load Review Claim',
  props<{ claimId: number }>(),
);

export const loadReviewClaimSuccess = createAction(
  '[Claims] Load Review Claim Success',
  props<{ claim: ClaimResponse }>(),
);

export const loadReviewClaimFailure = createAction(
  '[Claims] Load Review Claim Failure',
  props<{ error: string }>(),
);

export const startClaimReview = createAction(
  '[Claims] Start Claim Review',
  props<{ claimId: number }>(),
);

export const startClaimReviewSuccess = createAction(
  '[Claims] Start Claim Review Success',
  props<{ claim: ClaimResponse }>(),
);

export const startClaimReviewFailure = createAction(
  '[Claims] Start Claim Review Failure',
  props<{ error: string }>(),
);

export const approveClaim = createAction(
  '[Claims] Approve Claim',
  props<{
    claimId: number;
    approvedAmount: number;
  }>(),
);

export const approveClaimSuccess = createAction(
  '[Claims] Approve Claim Success',
  props<{ claim: ClaimResponse }>(),
);

export const approveClaimFailure = createAction(
  '[Claims] Approve Claim Failure',
  props<{ error: string }>(),
);

export const settleClaim = createAction(
  '[Claims] Settle Claim',
  props<{
    claimId: number;
    notes?: string;
  }>(),
);

export const settleClaimSuccess = createAction(
  '[Claims] Settle Claim Success',
  props<{ claim: ClaimResponse }>(),
);

export const settleClaimFailure = createAction(
  '[Claims] Settle Claim Failure',
  props<{ error: string }>(),
);

export const rejectClaim = createAction(
  '[Claims] Reject Claim',
  props<{
    claimId: number;
    reason: string;
  }>(),
);

export const rejectClaimSuccess = createAction(
  '[Claims] Reject Claim Success',
  props<{ claim: ClaimResponse }>(),
);

export const rejectClaimFailure = createAction(
  '[Claims] Reject Claim Failure',
  props<{ error: string }>(),
);

export const loadAdminClaims = createAction(
  '[Claims] Load Admin Claims',
  props<{ status?: ClaimStatus }>(),
);

export const loadAdminClaimsSuccess = createAction(
  '[Claims] Load Admin Claims Success',
  props<{ claims: ClaimResponse[] }>(),
);

export const loadAdminClaimsFailure = createAction(
  '[Claims] Load Admin Claims Failure',
  props<{ error: string }>(),
);

export const loadAdminClaim = createAction(
  '[Claims] Load Admin Claim',
  props<{ claimId: number }>(),
);

export const loadAdminClaimSuccess = createAction(
  '[Claims] Load Admin Claim Success',
  props<{ claim: ClaimResponse }>(),
);

export const loadAdminClaimFailure = createAction(
  '[Claims] Load Admin Claim Failure',
  props<{ error: string }>(),
);

export const clearSelectedClaim = createAction(
  '[Claims] Clear Selected Claim',
);

export const clearClaimsError = createAction(
  '[Claims] Clear Error',
);