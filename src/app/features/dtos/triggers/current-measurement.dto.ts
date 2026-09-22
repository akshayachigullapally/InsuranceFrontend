export interface CurrentMeasurementRequest {
  productId: number;
  locationZoneId: number;
  currentValue: number;
  idempotencyKey: string;
}

export interface CurrentMeasurementResult {
  matched: boolean;
  productId: number;
  productCode: string;
  productName: string;
  locationZoneId: number;
  measurementType?: string | null;
  measurementUnit?: string | null;
  currentValue: number;
  currentProductThresholdValue?: number | null;
  comparisonOperator?: string | null;
  triggerEventId?: number | null;
  triggerEventReference?: string | null;
  triggerEventStatus?: string | null;
  activePolicyCount: number;
  matchedPolicyCount: number;
  claimsCreatedCount: number;
  existingClaimsCount: number;
  notificationsCreatedCount: number;
  message: string;
}

export interface CurrentMeasurementSnapshot {
  productId?: number | null;
  locationZoneId: number;
  measurementType: string;
  measurementUnit: string;
  currentValue: number;
  recordedAt?: string | null;
  updatedAt?: string | null;
}
