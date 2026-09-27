import { Action, createReducer, on } from '@ngrx/store';
import { PricingRuleResponse } from '../../dtos/financial/pricing-rule-response.dto';
import {
  archivePricingRule,
  archivePricingRuleFailure,
  archivePricingRuleSuccess,
  clearPricingRulesError,
  clearPricingRulesFilters,
  clearSelectedPricingRule,
  createPricingRule,
  createPricingRuleFailure,
  createPricingRuleSuccess,
  loadPricingRule,
  loadPricingRuleFailure,
  loadPricingRules,
  loadPricingRulesFailure,
  loadPricingRulesSuccess,
  loadPricingRuleSuccess,
  setPricingRulesSearch,
  updatePricingRule,
  updatePricingRuleFailure,
  updatePricingRuleStatus,
  updatePricingRuleStatusFailure,
  updatePricingRuleStatusSuccess,
  updatePricingRuleSuccess,
} from './pricing-rules.actions';
import {
  initialPricingRulesState,
  PricingRulesState,
} from './pricing-rules.state';

function upsert(
  rules: PricingRuleResponse[],
  rule: PricingRuleResponse,
): PricingRuleResponse[] {
  return rules.some(item => item.id === rule.id)
    ? rules.map(item => (item.id === rule.id ? rule : item))
    : [rule, ...rules];
}

export const pricingRulesReducer = createReducer(
  initialPricingRulesState,

  on(loadPricingRules, (state): PricingRulesState => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(loadPricingRulesSuccess, (state, { pricingRules }): PricingRulesState => ({
    ...state,
    pricingRules,
    isLoading: false,
  })),

  on(loadPricingRulesFailure, (state, { error }): PricingRulesState => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(loadPricingRule, (state): PricingRulesState => ({
    ...state,
    selectedPricingRule: null,
    isLoading: true,
    error: null,
  })),

  on(
    loadPricingRuleSuccess,
    (state, { pricingRule }): PricingRulesState => ({
      ...state,
      selectedPricingRule: pricingRule,
      pricingRules: state.pricingRules.length
        ? upsert(state.pricingRules, pricingRule)
        : state.pricingRules,
      isLoading: false,
    }),
  ),

  on(loadPricingRuleFailure, (state, { error }): PricingRulesState => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(createPricingRule, (state): PricingRulesState => ({
    ...state,
    isSaving: true,
    updatingRuleId: null,
    error: null,
  })),

  on(
    updatePricingRule,
    updatePricingRuleStatus,
    (state, { ruleId }): PricingRulesState => ({
      ...state,
      isSaving: true,
      updatingRuleId: ruleId,
      error: null,
    }),
  ),

  on(archivePricingRule, (state, { ruleId }): PricingRulesState => ({
    ...state,
    isSaving: true,
    updatingRuleId: ruleId,
    error: null,
  })),

  on(
    createPricingRuleSuccess,
    (state, { pricingRule }): PricingRulesState => ({
      ...state,
      pricingRules: upsert(state.pricingRules, pricingRule),
      selectedPricingRule: pricingRule,
      isSaving: false,
      updatingRuleId: null,
    }),
  ),

  on(
    updatePricingRuleSuccess,
    updatePricingRuleStatusSuccess,
    (state, { pricingRule }): PricingRulesState => ({
      ...state,
      pricingRules: upsert(state.pricingRules, pricingRule),
      selectedPricingRule:
        state.selectedPricingRule?.id === pricingRule.id
          ? pricingRule
          : state.selectedPricingRule,
      isSaving: false,
      updatingRuleId: null,
    }),
  ),

  on(
    archivePricingRuleSuccess,
    (state, { ruleId }): PricingRulesState => ({
      ...state,
      // The rule still exists (and is listed again on reload) as ARCHIVED.
      pricingRules: state.pricingRules.map(rule =>
        rule.id === ruleId ? { ...rule, status: 'ARCHIVED' as const } : rule,
      ),
      selectedPricingRule:
        state.selectedPricingRule?.id === ruleId
          ? { ...state.selectedPricingRule, status: 'ARCHIVED' as const }
          : state.selectedPricingRule,
      isSaving: false,
      updatingRuleId: null,
    }),
  ),

  on(
    createPricingRuleFailure,
    updatePricingRuleFailure,
    updatePricingRuleStatusFailure,
    archivePricingRuleFailure,
    (state, { error }): PricingRulesState => ({
      ...state,
      isSaving: false,
      updatingRuleId: null,
      error,
    }),
  ),

  on(setPricingRulesSearch, (state, { search }): PricingRulesState => ({
    ...state,
    search,
  })),

  on(clearPricingRulesFilters, (state): PricingRulesState => ({
    ...state,
    search: '',
  })),

  on(clearSelectedPricingRule, (state): PricingRulesState => ({
    ...state,
    selectedPricingRule: null,
  })),

  on(clearPricingRulesError, (state): PricingRulesState => ({
    ...state,
    error: null,
  })),
);

export function reducer(
  state: PricingRulesState | undefined,
  action: Action,
): PricingRulesState {
  return pricingRulesReducer(state, action);
}
