import { ClaimResponse } from '../../dtos/claims/claim-response.dto';
import {
  selectAdminApprovedAmount,
  selectAdminApprovedClaimCount,
  selectAdminSubmittedClaimCount,
  selectAdminUnderReviewClaimCount,
  selectMyApprovedAmount,
  selectMyApprovedClaimCount,
  selectMySubmittedClaimCount,
  selectSubmittedClaimedAmount,
  selectSubmittedReviewCount,
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

  it('sums the approved amount of my approved claims only', () => {
    expect(selectMyApprovedAmount.projector(claims)).toBe(8000);
  });

  it('counts and sums the review queue', () => {
    const queue = claims.slice(0, 2);

    expect(selectSubmittedReviewCount.projector(queue)).toBe(2);
    expect(selectSubmittedClaimedAmount.projector(queue)).toBe(3000);
  });

  it('computes admin counts per status', () => {
    expect(selectAdminSubmittedClaimCount.projector(claims)).toBe(2);
    expect(selectAdminUnderReviewClaimCount.projector(claims)).toBe(1);
    expect(selectAdminApprovedClaimCount.projector(claims)).toBe(2);
  });

  it('treats a missing approved amount as zero', () => {
    expect(selectAdminApprovedAmount.projector(claims)).toBe(8000);
    expect(selectMyApprovedAmount.projector([])).toBe(0);
  });
});
