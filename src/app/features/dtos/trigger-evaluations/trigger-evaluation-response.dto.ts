export const TRIGGER_EVALUATION_RESULTS = [
  'MATCHED',
  'NOT_MATCHED',
  'INSUFFICIENT_OBSERVATIONS',
] as const;

export type TriggerEvaluationResult = (typeof TRIGGER_EVALUATION_RESULTS)[number];

export interface TriggerEvaluationResponse {
  id: number;
  evaluationReference: string;
  triggerDefinitionId: number;
  definitionCode?: string;
  definitionName?: string;
  locationZoneId: number;
  zoneCode?: string;
  zoneName?: string;
  measurementType: string;
  windowStart: string;
  windowEnd: string;
  observationCount: number;
  aggregatedValue: number;
  thresholdValue: number;
  comparisonOperator: string;
  result: TriggerEvaluationResult;
  evaluatedBy?: number | null;
  evaluatedAt?: string | null;
  triggerEventId?: number | null;
  triggerEventReference?: string | null;
}

export interface MessageResponse {
  message: string;
}
