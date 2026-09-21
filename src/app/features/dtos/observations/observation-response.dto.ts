export const OBSERVATION_STATUSES = [
  'RECEIVED',
  'VALIDATED',
  'REJECTED',
] as const;

export type ObservationStatus = (typeof OBSERVATION_STATUSES)[number];

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

export const OBSERVATION_SOURCES = [
  'MOCK',
  'MANUAL',
  'WEATHER_API',
  'SENSOR',
] as const;

export type ObservationSource = (typeof OBSERVATION_SOURCES)[number];

export interface ObservationResponse {
  id: number;
  observationReference: string;
  locationZoneId: number;
  locationZoneCode?: string;
  locationZoneName?: string;
  measurementType: MeasurementType;
  measurementUnit: MeasurementUnit;
  observedValue: number;
  observedAt: string;
  source: ObservationSource;
  sourceReference?: string | null;
  status: ObservationStatus;
  receivedBy?: number | null;
  receivedAt?: string | null;
}

export interface CreateObservationRequest {
  locationZoneId: number;
  measurementType: MeasurementType;
  measurementUnit: MeasurementUnit;
  observedValue: number;
  observedAt: string;
  source: ObservationSource;
  sourceReference?: string;
}

export interface ObservationRejectRequest {
  reason: string;
}

export interface MessageResponse {
  message: string;
}
