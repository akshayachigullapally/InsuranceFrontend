import { PolicyResponse } from '../../dtos/policies/policy-response.dto';
import {
  selectActivePolicyCount,
  selectActiveSumInsured,
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
});
