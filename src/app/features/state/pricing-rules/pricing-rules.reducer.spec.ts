import { pricingRulesReducer } from './pricing-rules.reducer';
import { initialPricingRulesState, PricingRulesState } from './pricing-rules.state';
import * as PricingRulesActions from './pricing-rules.actions';
import { PricingRuleResponse } from '../../dtos/financial/pricing-rule-response.dto';

function makeRule(id: number, status = 'ACTIVE'): PricingRuleResponse {
  return { id, productId: id, status } as PricingRuleResponse;
}

describe('pricingRulesReducer', () => {
  it('returns the initial state for an unknown action', () => {
    expect(pricingRulesReducer(undefined, { type: '[Unknown]' } as never)).toEqual(initialPricingRulesState);
  });

  it('loads pricing rules', () => {
    const rules = [makeRule(1)];

    const state = pricingRulesReducer(
      { ...initialPricingRulesState, isLoading: true },
      PricingRulesActions.loadPricingRulesSuccess({ pricingRules: rules }),
    );

    expect(state.pricingRules).toEqual(rules);
    expect(state.isLoading).toBe(false);
  });

  it('adds a created rule and selects it', () => {
    const state = pricingRulesReducer(
      initialPricingRulesState,
      PricingRulesActions.createPricingRuleSuccess({ pricingRule: makeRule(3) }),
    );

    expect(state.pricingRules.map((rule) => rule.id)).toEqual([3]);
    expect(state.selectedPricingRule?.id).toBe(3);
  });

  it('tracks the rule being updated', () => {
    const state = pricingRulesReducer(
      initialPricingRulesState,
      PricingRulesActions.archivePricingRule({ ruleId: 4 }),
    );

    expect(state.updatingRuleId).toBe(4);
    expect(state.isSaving).toBe(true);
  });

  it('replaces an updated rule', () => {
    const current: PricingRulesState = { ...initialPricingRulesState, pricingRules: [makeRule(1)] };

    const state = pricingRulesReducer(
      current,
      PricingRulesActions.updatePricingRuleStatusSuccess({ pricingRule: makeRule(1, 'INACTIVE') }),
    );

    expect(state.pricingRules[0].status).toBe('INACTIVE');
  });

  it('keeps an archived rule in the list as ARCHIVED', () => {
    const current: PricingRulesState = { ...initialPricingRulesState, pricingRules: [makeRule(1), makeRule(2)] };

    const state = pricingRulesReducer(current, PricingRulesActions.archivePricingRuleSuccess({ ruleId: 1 }));

    expect(state.pricingRules.map((rule) => rule.id)).toEqual([1, 2]);
    expect(state.pricingRules.find((rule) => rule.id === 1)?.status).toBe('ARCHIVED');
    expect(state.updatingRuleId).toBeNull();
  });

  it('stores failures and clears the error', () => {
    const failed = pricingRulesReducer(
      initialPricingRulesState,
      PricingRulesActions.createPricingRuleFailure({ error: 'Overlapping rule' }),
    );
    expect(failed.error).toBe('Overlapping rule');

    expect(pricingRulesReducer(failed, PricingRulesActions.clearPricingRulesError()).error).toBeNull();
  });
});
