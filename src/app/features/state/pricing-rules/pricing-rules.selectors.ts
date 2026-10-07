import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PricingRulesState } from './pricing-rules.state';

const selectPricingRulesState = createFeatureSelector<PricingRulesState>('pricingRules');

export const selectPricingRules = createSelector(
  selectPricingRulesState,
  (state) => state.pricingRules,
);

export const selectPricingRulesLoading = createSelector(
  selectPricingRulesState,
  (state) => state.isLoading,
);

export const selectPricingRulesSaving = createSelector(
  selectPricingRulesState,
  (state) => state.isSaving,
);

export const selectUpdatingRuleId = createSelector(
  selectPricingRulesState,
  (state) => state.updatingRuleId,
);

export const selectPricingRulesError = createSelector(
  selectPricingRulesState,
  (state) => state.error,
);
