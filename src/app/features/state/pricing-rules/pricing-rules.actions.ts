import { createAction, props } from '@ngrx/store';
import {
  PricingRuleManageableStatus,
  PricingRuleRequest,
  PricingRuleResponse,
} from '../../dtos/financial/pricing-rule-response.dto';

export const loadPricingRules = createAction('[Pricing Rules] Load Pricing Rules');

export const loadPricingRulesSuccess = createAction(
  '[Pricing Rules] Load Pricing Rules Success',
  props<{ pricingRules: PricingRuleResponse[] }>(),
);

export const loadPricingRulesFailure = createAction(
  '[Pricing Rules] Load Pricing Rules Failure',
  props<{ error: string }>(),
);

export const loadPricingRule = createAction(
  '[Pricing Rules] Load Pricing Rule',
  props<{ ruleId: number }>(),
);

export const loadPricingRuleSuccess = createAction(
  '[Pricing Rules] Load Pricing Rule Success',
  props<{ pricingRule: PricingRuleResponse }>(),
);

export const loadPricingRuleFailure = createAction(
  '[Pricing Rules] Load Pricing Rule Failure',
  props<{ error: string }>(),
);

export const createPricingRule = createAction(
  '[Pricing Rules] Create Pricing Rule',
  props<{ request: PricingRuleRequest }>(),
);

export const createPricingRuleSuccess = createAction(
  '[Pricing Rules] Create Pricing Rule Success',
  props<{ pricingRule: PricingRuleResponse }>(),
);

export const createPricingRuleFailure = createAction(
  '[Pricing Rules] Create Pricing Rule Failure',
  props<{ error: string }>(),
);

export const updatePricingRule = createAction(
  '[Pricing Rules] Update Pricing Rule',
  props<{ ruleId: number; request: PricingRuleRequest }>(),
);

export const updatePricingRuleSuccess = createAction(
  '[Pricing Rules] Update Pricing Rule Success',
  props<{ pricingRule: PricingRuleResponse }>(),
);

export const updatePricingRuleFailure = createAction(
  '[Pricing Rules] Update Pricing Rule Failure',
  props<{ error: string }>(),
);

export const updatePricingRuleStatus = createAction(
  '[Pricing Rules] Update Pricing Rule Status',
  props<{ ruleId: number; status: PricingRuleManageableStatus }>(),
);

export const updatePricingRuleStatusSuccess = createAction(
  '[Pricing Rules] Update Pricing Rule Status Success',
  props<{ pricingRule: PricingRuleResponse }>(),
);

export const updatePricingRuleStatusFailure = createAction(
  '[Pricing Rules] Update Pricing Rule Status Failure',
  props<{ error: string }>(),
);

export const archivePricingRule = createAction(
  '[Pricing Rules] Archive Pricing Rule',
  props<{ ruleId: number }>(),
);

export const archivePricingRuleSuccess = createAction(
  '[Pricing Rules] Archive Pricing Rule Success',
  props<{ ruleId: number }>(),
);

export const archivePricingRuleFailure = createAction(
  '[Pricing Rules] Archive Pricing Rule Failure',
  props<{ error: string }>(),
);

export const setPricingRulesSearch = createAction(
  '[Pricing Rules] Set Search',
  props<{ search: string }>(),
);

export const clearPricingRulesFilters = createAction(
  '[Pricing Rules] Clear Filters',
);
export const clearSelectedPricingRule = createAction(
  '[Pricing Rules] Clear Selected Pricing Rule',
);
export const clearPricingRulesError = createAction(
  '[Pricing Rules] Clear Error',
);
