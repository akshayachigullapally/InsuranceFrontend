const TRIGGER_EVENT_STATUSES = [
  'DETECTED',
  'UNDER_VALIDATION',
  'VERIFIED',
  'REJECTED',
  'PROCESSED',
] as const;

export type TriggerEventStatus = (typeof TRIGGER_EVENT_STATUSES)[number];

export interface TriggerEventResponse {
  id: number;
  eventReference: string;
  triggerDefinitionId: number;
  triggerEvaluationId: number;
  perilId: number;
  perilCode?: string;
  perilName?: string;
  locationZoneId: number;
  zoneCode?: string;
  zoneName?: string;
  productId: number;
  measurementType: string;
  measurementUnit: string;
  comparisonOperator: string;
  aggregatedValue: number;
  thresholdValue: number;
  windowStart: string;
  windowEnd: string;
  status: TriggerEventStatus;
  detectedAt: string;
  reviewedBy?: number | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  definitionCode?: string;
  definitionName?: string;
}

export interface MessageResponse {
  message: string;
}
