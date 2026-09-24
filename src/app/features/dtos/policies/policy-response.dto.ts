export const POLICY_STATUSES = [
  'PENDING',
  'ACTIVE',
  'REJECTED',
  'CANCELLED',
  'EXPIRED',
] as const;

export type PolicyStatus = (typeof POLICY_STATUSES)[number];

export interface PolicyResponse {
  id: number;
  policyNumber: string;
  customerId: number;
  productId: number;
  productCode: string;
  productName: string;
  locationZoneId: number;
  sumInsured: number;
  premiumAmount: number;
  termMonths: number;
  startDate?: string | null;
  endDate?: string | null;
  status: PolicyStatus;
  rejectionReason?: string | null;
  reviewedBy?: number | null;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  triggerSnapshotId?: number | null;
}

export interface CreatePolicyRequest {
  productId: number;
  locationZoneId: number;
  sumInsured: number;
  termMonths: number;
  quoteId?: number;
  perilCode?: string;
  triggerMetric?: string;
  triggerOperator?: string;
  triggerThreshold?: number;
  triggerDurationHours?: number;
  triggerAggregationType?: string;
  triggerMinObservationCount?: number;
}

export interface CreateCustomPolicyRequest {
  name?: string;
  description?: string;
  category: string;
  sumInsured: number;
  termMonths: number;
  locationZoneId: number;
  perilCode: string;
  measurementType: string;
  measurementUnit: string;
  thresholdValue: number;
  comparisonOperator: string;
  aggregationType: string;
  observationWindowHours: number;
  minimumObservationCount: number;
  triggerDescription?: string;
}

export interface PolicyDecisionRequest {
  reason: string;
}

export interface PolicyStatusHistoryResponse {
  id: number;
  policyId: number;
  oldStatus: string;
  newStatus: string;
  changedBy: number;
  changeReason: string;
  changedAt: string;
}

export interface PolicyTriggerSnapshotResponse {
  id: number;
  policyId: number;
  perilCode: string;
  triggerMetric: string;
  triggerOperator: string;
  triggerThreshold: number;
  triggerDurationHours: number;
  triggerAggregationType: string;
  triggerMinObservationCount: number;
  productId?: number;
  productCode?: string;
  measurementType?: string;
  measurementUnit?: string;
  thresholdValue?: number;
  comparisonOperator?: string;
  aggregationType?: string;
  observationWindowHours?: number;
  minimumObservationCount?: number;
  triggerDescription?: string | null;
  humanReadableTrigger?: string | null;
  capturedAt?: string;
  createdAt: string;
}

export interface MessageResponse {
  message: string;
}