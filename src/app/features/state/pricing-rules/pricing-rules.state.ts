import { PricingRuleResponse } from '../../dtos/financial/pricing-rule-response.dto';

export interface PricingRulesState {
  pricingRules: PricingRuleResponse[];
  selectedPricingRule: PricingRuleResponse | null;
  search: string;
  isLoading: boolean;
  isSaving: boolean;
  updatingRuleId: number | null;
  error: string | null;
}

export const initialPricingRulesState: PricingRulesState = {
  pricingRules: [],
  selectedPricingRule: null,
  search: '',
  isLoading: false,
  isSaving: false,
  updatingRuleId: null,
  error: null,
};
