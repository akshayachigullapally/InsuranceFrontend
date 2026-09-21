export const PRICING_RULE_STATUSES = [
  'DRAFT',
  'ACTIVE',
  'INACTIVE',
  'ARCHIVED',
] as const;

export type PricingRuleStatus = (typeof PRICING_RULE_STATUSES)[number];

export const PRICING_RULE_MANAGEABLE_STATUSES = [
  'DRAFT',
  'ACTIVE',
  'INACTIVE',
] as const;

export type PricingRuleManageableStatus =
  (typeof PRICING_RULE_MANAGEABLE_STATUSES)[number];

export interface PricingRuleRequest {
  productId: number;
  baseAnnualRate: number;
  minimumPremium: number;
  termFactor: number;
  locationZoneId?: number | null;
  locationFactor: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface UpdatePricingRuleStatusRequest {
  status: PricingRuleManageableStatus;
}

export interface PricingRuleResponse {
  id: number;
  productId: number;
  baseAnnualRate: number;
  minimumPremium: number;
  termFactor: number;
  locationZoneId: number | null;
  locationFactor: number;
  status: PricingRuleStatus;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdBy: number | null;
  createdAt: string;
  updatedBy: number | null;
  updatedAt: string | null;
}

export interface MessageResponse {
  message: string;
}
