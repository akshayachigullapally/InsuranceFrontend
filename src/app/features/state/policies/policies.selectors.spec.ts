import { PolicyResponse } from '../../dtos/policies/policy-response.dto';
import {
  selectActivePolicyCount,
  selectActiveSumInsured,
  selectAdminActivePolicyCount,
  selectAdminActivePremium,
  selectAdminApprovedPolicyCount,
  selectAdminPendingPolicyCount,
  selectAdminRejectedPolicyCount,
  selectPendingPolicyCount,
  selectPendingReviewCount,
} from './policies.selectors';

function policy(status: PolicyResponse['status'], sumInsured: number, premiumAmount: number): PolicyResponse {
  return { status, sumInsured, premiumAmount } as PolicyResponse;
}

describe('policies selectors', () => {
  const policies = [
    policy('ACTIVE', 100000, 1000),
    policy('ACTIVE', 50000, 600),
    policy('PENDING', 70000, 800),
    policy('EXPIRED', 20000, 300),
    policy('REJECTED', 10000, 200),
  ];

  it('counts and sums my active policies', () => {
    expect(selectActivePolicyCount.projector(policies)).toBe(2);
    expect(selectActiveSumInsured.projector(policies)).toBe(150000);
  });

  it('counts pending policies for the customer and the review queue', () => {
    expect(selectPendingPolicyCount.projector(policies)).toBe(1);
    expect(selectPendingReviewCount.projector(policies)).toBe(1);
  });

  it('computes admin counts', () => {
    expect(selectAdminPendingPolicyCount.projector(policies)).toBe(1);
    expect(selectAdminActivePolicyCount.projector(policies)).toBe(2);
    expect(selectAdminRejectedPolicyCount.projector(policies)).toBe(1);
  });

  it('counts active and expired policies as approved', () => {
    expect(selectAdminApprovedPolicyCount.projector(policies)).toBe(3);
  });

  it('sums the premium of active policies only', () => {
    expect(selectAdminActivePremium.projector(policies)).toBe(1600);
    expect(selectAdminActivePremium.projector([])).toBe(0);
  });
});
