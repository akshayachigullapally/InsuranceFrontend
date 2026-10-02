export interface AdminProductTriggerStatus {
  productId: number;
  productCode: string;
  productName: string;
  thresholdValue?: number | null;
  comparisonOperator?: string | null;
  aggregationType?: string | null;
  observationWindowHours?: number | null;
  minimumObservationCount?: number | null;
  triggered: boolean;
}

export interface AdminMeasurementStatusCard {
  measurementType: string | null;
  displayName?: string | null;
  measurementUnit?: string | null;
  currentValue?: number | null;
  observedAt?: string | null;
  zoneCode?: string | null;
  zoneName?: string | null;
  /** MOCK for the demo feed, MANUAL when an admin set the value. */
  source?: string | null;
  products: AdminProductTriggerStatus[];
}

export interface ManualReadingRequest {
  measurementType: string;
  value: number;
  /** Products checked for triggered policies, like the trigger simulator does. */
  productIds: number[];
}

export interface ManualReadingResponse {
  measurementType: string;
  measurementUnit: string;
  value: number;
  previousValue?: number | null;
  observedAt: string;
  zoneCount: number;
  holdMinutes: number;
  matchedPolicyCount: number;
  claimsCreatedCount: number;
  unpaidPolicyCount: number;
  triggeredProducts: string[];
}
