export const TRIGGER_MEASUREMENT_TYPES = [
  'RAINFALL',
  'WATER_LEVEL',
  'RIVER_LEVEL',
  'TEMPERATURE',
  'WIND_SPEED',
  'HUMIDITY',
  'SOIL_MOISTURE',
  'OTHER',
] as const;

export type TriggerMeasurementType = (typeof TRIGGER_MEASUREMENT_TYPES)[number];
export type TriggerMeasurementTypeValue = string;

export const PRODUCT_MEASUREMENT_TYPES = [
  'RAINFALL',
  'WATER_LEVEL',
  'TEMPERATURE',
  'WIND_SPEED',
  'HUMIDITY',
  'SOIL_MOISTURE',
  'OTHER',
] as const;

export const TRIGGER_MEASUREMENT_UNITS = [
  'MM',
  'CM',
  'METER',
  'CELSIUS',
  'KELVIN',
  'KM_PER_HOUR',
  'METERS_PER_SECOND',
  'PERCENTAGE',
  'OTHER',
] as const;

export type TriggerMeasurementUnit = (typeof TRIGGER_MEASUREMENT_UNITS)[number];
export type TriggerMeasurementUnitValue = string;

export const TRIGGER_COMPARISON_OPERATORS = [
  'GREATER_THAN',
  'GREATER_THAN_OR_EQUAL',
  'LESS_THAN',
  'LESS_THAN_OR_EQUAL',
  'EQUAL',
] as const;

export type TriggerComparisonOperator =
  (typeof TRIGGER_COMPARISON_OPERATORS)[number];
export type TriggerComparisonOperatorValue = string;

export const TRIGGER_AGGREGATION_TYPES = [
  'SUM',
  'AVERAGE',
  'MIN',
  'MAX',
  'LATEST',
] as const;

export type TriggerAggregationType = (typeof TRIGGER_AGGREGATION_TYPES)[number];
export type TriggerAggregationTypeValue = string;

export const TRIGGER_SYNC_STATUSES = [
  'PENDING',
  'SYNCED',
  'FAILED',
] as const;

export type TriggerSyncStatus = (typeof TRIGGER_SYNC_STATUSES)[number];
export type TriggerSyncStatusValue = string;

export interface TriggerCondition {
  perilCode?: string | null;
  measurementType?: TriggerMeasurementTypeValue | null;
  measurementUnit?: TriggerMeasurementUnitValue | null;
  thresholdValue?: number | null;
  comparisonOperator?: TriggerComparisonOperatorValue | null;
  aggregationType?: TriggerAggregationTypeValue | null;
  observationWindowHours?: number | null;
  minimumObservationCount?: number | null;
  triggerDescription?: string | null;
  humanReadableTrigger?: string | null;
}

export interface ProductTriggerThresholdUpdateRequest {
  perilCode: string;
  measurementType: string;
  measurementUnit: string;
  thresholdValue: number;
  comparisonOperator: string;
  aggregationType: string;
  observationWindowHours: number;
  minimumObservationCount: number;
  triggerDescription?: string;
  changeReason?: string;
}

export interface ProductTriggerThresholdUpdateResponse {
  productId?: number;
  productCode?: string;
  previousThresholdValue?: number | null;
  newThresholdValue?: number | null;
  measurementUnit?: string;
  triggerDescription?: string;
  triggerSyncStatus?: string;
  existingPoliciesUpdated?: boolean;
  triggeredPolicyCount?: number;
  createdClaimCount?: number;
  message?: string;
}

export interface ProductTriggerThresholdHistoryResponse {
  id?: number;
  productId?: number;
  productCode?: string;
  previousPerilCode?: string | null;
  newPerilCode?: string | null;
  previousMeasurementType?: string | null;
  newMeasurementType?: string | null;
  previousMeasurementUnit?: string | null;
  newMeasurementUnit?: string | null;
  previousThresholdValue?: number | null;
  newThresholdValue?: number | null;
  previousComparisonOperator?: string | null;
  newComparisonOperator?: string | null;
  previousAggregationType?: string | null;
  newAggregationType?: string | null;
  previousObservationWindowHours?: number | null;
  newObservationWindowHours?: number | null;
  previousMinimumObservationCount?: number | null;
  newMinimumObservationCount?: number | null;
  changedBy?: number | null;
  changeReason?: string | null;
  changedAt?: string | null;
  triggerSyncStatus?: string | null;
}

export type LiveConditionState =
  | 'NO_DATA'
  | 'NORMAL'
  | 'APPROACHING'
  | 'THRESHOLD_EXCEEDED';

export interface LiveCondition {
  zoneId: number;
  zoneCode?: string;
  zoneName?: string;
  productId?: number;
  productCode?: string;
  productName?: string;
  condition: TriggerCondition;
  liveValue: number | null;
  liveUnit?: string | null;
  observedAt?: string | null;
  state: LiveConditionState;
}