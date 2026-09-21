export const TRIGGER_DEFINITION_STATUSES = [
  'DRAFT',
  'ACTIVE',
  'INACTIVE',
  'ARCHIVED',
] as const;

export type TriggerDefinitionStatus = (typeof TRIGGER_DEFINITION_STATUSES)[number];

export const TRIGGER_DEFINITION_MANAGEABLE_STATUSES = [
  'ACTIVE',
  'INACTIVE',
] as const;

export type TriggerDefinitionManageableStatus =
  (typeof TRIGGER_DEFINITION_MANAGEABLE_STATUSES)[number];

export const MEASUREMENT_TYPES = [
  'RAINFALL',
  'TEMPERATURE',
  'WIND_SPEED',
  'HUMIDITY',
  'RIVER_LEVEL',
  'SOIL_MOISTURE',
] as const;

export type MeasurementType = (typeof MEASUREMENT_TYPES)[number];

export const MEASUREMENT_UNITS = [
  'MM',
  'CELSIUS',
  'KM_PER_HOUR',
  'PERCENTAGE',
  'METER',
] as const;

export type MeasurementUnit = (typeof MEASUREMENT_UNITS)[number];

export const AGGREGATION_TYPES = [
  'SUM',
  'AVERAGE',
  'MINIMUM',
  'MAXIMUM',
  'LATEST',
] as const;

export type AggregationType = (typeof AGGREGATION_TYPES)[number];

export const COMPARISON_OPERATORS = [
  'GREATER_THAN',
  'GREATER_THAN_OR_EQUAL',
  'LESS_THAN',
  'LESS_THAN_OR_EQUAL',
  'EQUAL',
] as const;

export type ComparisonOperator = (typeof COMPARISON_OPERATORS)[number];

export interface TriggerDefinitionResponse {
  id: number;
  definitionCode: string;
  definitionName: string;
  description: string;
  perilId: number;
  perilCode?: string;
  perilName?: string;
  locationZoneId: number;
  zoneCode?: string;
  zoneName?: string;
  productId: number;
  measurementType: MeasurementType;
  measurementUnit: MeasurementUnit;
  aggregationType: AggregationType;
  comparisonOperator: ComparisonOperator;
  thresholdValue: number;
  observationWindowHours: number;
  minimumObservationCount: number;
  status: TriggerDefinitionStatus;
  effectiveFrom: string;
  effectiveTo?: string | null;
  createdBy?: number | null;
  createdAt?: string | null;
  updatedBy?: number | null;
  updatedAt?: string | null;
}

export interface TriggerDefinitionRequest {
  definitionCode: string;
  definitionName: string;
  description: string;
  perilId: number;
  locationZoneId: number;
  productId: number;
  measurementType: MeasurementType;
  measurementUnit: MeasurementUnit;
  aggregationType: AggregationType;
  comparisonOperator: ComparisonOperator;
  thresholdValue: number;
  observationWindowHours: number;
  minimumObservationCount: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface UpdateTriggerDefinitionStatusRequest {
  status: TriggerDefinitionManageableStatus;
}

export interface MessageResponse {
  message: string;
}
