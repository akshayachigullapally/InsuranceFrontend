import { ClaimResponse } from '../../dtos/claims/claim-response.dto';
import {
  selectMyApprovedClaimCount,
  selectMySubmittedClaimCount,
} from './claims.selectors';

function claim(status: ClaimResponse['status'], claimedAmount: number, approvedAmount: number | null = null) {
  return { status, claimedAmount, approvedAmount } as ClaimResponse;
}

describe('claims selectors', () => {
  const claims = [
    claim('SUBMITTED', 1000),
    claim('SUBMITTED', 2000),
    claim('UNDER_REVIEW', 3000),
    claim('APPROVED', 4000, 3500),
    claim('APPROVED', 5000, 4500),
    claim('REJECTED', 6000),
  ];

  it('counts my submitted and approved claims', () => {
    expect(selectMySubmittedClaimCount.projector(claims)).toBe(2);
    expect(selectMyApprovedClaimCount.projector(claims)).toBe(2);
  });
});
