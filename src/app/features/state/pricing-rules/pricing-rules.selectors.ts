import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PricingRulesState } from './pricing-rules.state';

const selectPricingRulesState =
  createFeatureSelector<PricingRulesState>('pricingRules');

export const selectPricingRules = createSelector(
  selectPricingRulesState,
  state => state.pricingRules,
);

export const selectSelectedPricingRule = createSelector(
  selectPricingRulesState,
  state => state.selectedPricingRule,
);

export const selectPricingRulesSearch = createSelector(
  selectPricingRulesState,
  state => state.search,
);

export const selectPricingRulesLoading = createSelector(
  selectPricingRulesState,
  state => state.isLoading,
);

export const selectPricingRulesSaving = createSelector(
  selectPricingRulesState,
  state => state.isSaving,
);

export const selectUpdatingRuleId = createSelector(
  selectPricingRulesState,
  state => state.updatingRuleId,
);

export const selectPricingRulesError = createSelector(
  selectPricingRulesState,
  state => state.error,
);

export const selectFilteredPricingRules = createSelector(
  selectPricingRules,
  selectPricingRulesSearch,
  (rules, search) => {
    const value = search.trim().toLowerCase();

    if (!value) return rules;

    return rules.filter(
      rule =>
        rule.productId.toString().includes(value) ||
        rule.status.toLowerCase().includes(value),
    );
  },
);

export const selectActivePricingRuleCount = createSelector(
  selectPricingRules,
  rules => rules.filter(rule => rule.status === 'ACTIVE').length,
);

export const selectDraftPricingRuleCount = createSelector(
  selectPricingRules,
  rules => rules.filter(rule => rule.status === 'DRAFT').length,
);

export const selectInactivePricingRuleCount = createSelector(
  selectPricingRules,
  rules => rules.filter(rule => rule.status === 'INACTIVE').length,
);
