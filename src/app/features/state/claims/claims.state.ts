import {
  ClaimResponse,
  ClaimStatus,
} from '../../dtos/claims/claim-response.dto';

export interface ClaimsState {
  myClaims: ClaimResponse[];
  submittedClaims: ClaimResponse[];
  adminClaims: ClaimResponse[];
  selectedClaim: ClaimResponse | null;
  myClaimsStatus: ClaimStatus | null;
  adminClaimsStatus: ClaimStatus | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export const initialClaimsState: ClaimsState = {
  myClaims: [],
  submittedClaims: [],
  adminClaims: [],
  selectedClaim: null,
  myClaimsStatus: null,
  adminClaimsStatus: null,
  isLoading: false,
  isSaving: false,
  error: null,
};