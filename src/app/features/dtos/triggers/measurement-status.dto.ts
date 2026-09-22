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
  products: AdminProductTriggerStatus[];
}
