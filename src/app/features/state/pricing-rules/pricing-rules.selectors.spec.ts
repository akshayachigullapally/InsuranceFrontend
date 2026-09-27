import { PricingRuleResponse } from '../../dtos/financial/pricing-rule-response.dto';
import {
  selectActivePricingRuleCount,
  selectDraftPricingRuleCount,
  selectFilteredPricingRules,
  selectInactivePricingRuleCount,
} from './pricing-rules.selectors';

function rule(id: number, productId: number, status: string): PricingRuleResponse {
  return { id, productId, status } as PricingRuleResponse;
}

describe('pricing rules selectors', () => {
  const rules = [rule(1, 10, 'ACTIVE'), rule(2, 11, 'DRAFT'), rule(3, 20, 'INACTIVE'), rule(4, 21, 'ACTIVE')];

  it('returns every rule for a blank search', () => {
    expect(selectFilteredPricingRules.projector(rules, ' ').length).toBe(4);
  });

  it('searches by product id and status', () => {
    expect(selectFilteredPricingRules.projector(rules, '2').map((r) => r.id)).toEqual([3, 4]);
    expect(selectFilteredPricingRules.projector(rules, 'draft').map((r) => r.id)).toEqual([2]);
  });

  it('counts rules per status', () => {
    expect(selectActivePricingRuleCount.projector(rules)).toBe(2);
    expect(selectDraftPricingRuleCount.projector(rules)).toBe(1);
    expect(selectInactivePricingRuleCount.projector(rules)).toBe(1);
  });
});
