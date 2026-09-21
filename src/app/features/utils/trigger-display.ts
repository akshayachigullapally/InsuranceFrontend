import {
  LiveCondition,
  LiveConditionState,
  TriggerAggregationTypeValue,
  TriggerComparisonOperatorValue,
  TriggerCondition,
  TriggerMeasurementTypeValue,
  TriggerMeasurementUnitValue,
  TriggerSyncStatusValue,
} from '../dtos/triggers/trigger-condition.dto';

export const MEASUREMENT_TYPE_LABELS: Record<string, string> = {
  RAINFALL: 'Rainfall',
  WATER_LEVEL: 'Water Level',
  RIVER_LEVEL: 'River Level',
  TEMPERATURE: 'Temperature',
  WIND_SPEED: 'Wind Speed',
  HUMIDITY: 'Humidity',
  SOIL_MOISTURE: 'Soil Moisture',
  OTHER: 'Other',
};

export const MEASUREMENT_UNIT_LABELS: Record<string, string> = {
  MM: 'mm',
  CM: 'cm',
  METER: 'm',
  CELSIUS: '°C',
  KELVIN: 'K',
  KM_PER_HOUR: 'km/h',
  METERS_PER_SECOND: 'm/s',
  PERCENTAGE: '%',
  OTHER: '',
};

const MEASUREMENT_UNIT_ALIASES: Record<string, string> = {
  mm: 'MM',
  m: 'METER',
  c: 'CELSIUS',
  '°c': 'CELSIUS',
  '°C': 'CELSIUS',
  celsius: 'CELSIUS',
  'km/h': 'KM_PER_HOUR',
  'kmh': 'KM_PER_HOUR',
  '%': 'PERCENTAGE',
  pct: 'PERCENTAGE',
  percentage: 'PERCENTAGE',
};

export const COMPARISON_OPERATOR_LABELS: Record<string, string> = {
  GREATER_THAN: 'greater than',
  GREATER_THAN_OR_EQUAL: 'greater than or equal to',
  LESS_THAN: 'less than',
  LESS_THAN_OR_EQUAL: 'less than or equal to',
  EQUAL: 'equal to',
};

export const COMPARISON_OPERATOR_SYMBOLS: Record<string, string> = {
  GREATER_THAN: '>',
  GREATER_THAN_OR_EQUAL: '≥',
  LESS_THAN: '<',
  LESS_THAN_OR_EQUAL: '≤',
  EQUAL: '=',
};

export const AGGREGATION_TYPE_LABELS: Record<string, string> = {
  SUM: 'total',
  AVERAGE: 'average',
  MIN: 'minimum',
  MAX: 'maximum',
  LATEST: 'latest',
};

export const TRIGGER_SYNC_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Not synced',
  SYNCED: 'Synced',
  FAILED: 'Sync failed',
};

export const TRIGGER_SYNC_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-warn-50 text-warn-700',
  SYNCED: 'bg-success-50 text-success-700',
  FAILED: 'bg-danger-50 text-danger-700',
};

export function normalizeMeasurementType(value: string | null | undefined): string {
  if (!value) return '';
  const upper = value.trim().toUpperCase();
  if (upper === 'RIVER_LEVEL') return 'RIVER_LEVEL';
  if (upper === 'WATER_LEVEL') return 'WATER_LEVEL';
  return upper;
}

export function normalizeMeasurementUnit(value: string | null | undefined): string {
  if (!value) return '';
  const trimmed = value.trim();
  const upper = trimmed.toUpperCase();
  const known = MEASUREMENT_UNIT_LABELS[upper];
  if (known !== undefined) return upper;
  const alias = MEASUREMENT_UNIT_ALIASES[upper] ?? MEASUREMENT_UNIT_ALIASES[trimmed];
  return alias ?? upper;
}

export function measurementTypeLabel(
  value: TriggerMeasurementTypeValue | null | undefined,
): string {
  const key = normalizeMeasurementType(value);
  if (!key) return 'Trigger metric';
  return MEASUREMENT_TYPE_LABELS[key] ?? key.replace(/_/g, ' ').toLowerCase();
}

export function measurementUnitLabel(
  value: TriggerMeasurementUnitValue | null | undefined,
): string {
  const key = normalizeMeasurementUnit(value);
  if (!key) return '';
  return MEASUREMENT_UNIT_LABELS[key] ?? '';
}

export function comparisonOperatorLabel(
  value: TriggerComparisonOperatorValue | null | undefined,
): string {
  if (!value) return '';
  return COMPARISON_OPERATOR_LABELS[value] ?? value.toLowerCase();
}

export function comparisonOperatorSymbol(
  value: TriggerComparisonOperatorValue | null | undefined,
): string {
  if (!value) return '';
  return COMPARISON_OPERATOR_SYMBOLS[value] ?? value.toLowerCase();
}

export function aggregationTypeLabel(
  value: TriggerAggregationTypeValue | null | undefined,
): string {
  if (!value) return '';
  return AGGREGATION_TYPE_LABELS[value] ?? value.toLowerCase();
}

export function triggerSyncStatusLabel(
  status: TriggerSyncStatusValue | null | undefined,
): string {
  if (!status) return TRIGGER_SYNC_STATUS_LABELS['PENDING'];
  return TRIGGER_SYNC_STATUS_LABELS[status] ?? status;
}

export function triggerSyncStatusColor(
  status: TriggerSyncStatusValue | null | undefined,
): string {
  if (!status) return TRIGGER_SYNC_STATUS_COLORS['PENDING'];
  return TRIGGER_SYNC_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700';
}

export function formatThresholdValue(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatObservationWindowHours(hours: number | null | undefined): string {
  if (hours === null || hours === undefined) return '';
  if (hours < 24) return `${hours}h`;
  const days = hours / 24;
  if (Number.isInteger(days)) {
    return `${days}d`;
  }
  return `${hours}h`;
}

export function buildTriggerSentence(condition: TriggerCondition): string {
  const label = condition.humanReadableTrigger?.trim();
  if (label) return label;

  const type = measurementTypeLabel(condition.measurementType);
  const agg = aggregationTypeLabel(condition.aggregationType);
  const op = comparisonOperatorLabel(condition.comparisonOperator);
  const value = formatThresholdValue(condition.thresholdValue);
  const unit = measurementUnitLabel(condition.measurementUnit);
  const window = formatObservationWindowHours(condition.observationWindowHours);

  const parts: string[] = [];
  if (type) parts.push(type);
  if (parts.length) {
    if (agg) {
      parts[0] = `${agg} ${parts[0]}`;
    }
  } else if (agg) {
    parts.push(agg);
  }

  const comparison = [op, value, unit].filter((p) => p).join(' ');
  if (comparison) parts.push(comparison);
  if (window) parts.push(`over the past ${window}`);

  return parts.join(' ') || 'Trigger condition not configured';
}

export function hasTriggerCondition(condition: TriggerCondition | null | undefined): boolean {
  if (!condition) return false;
  if (condition.thresholdValue === null || condition.thresholdValue === undefined) {
    return false;
  }
  return Boolean(condition.comparisonOperator) || Boolean(condition.humanReadableTrigger);
}

export function liveConditionState(
  liveValue: number | null | undefined,
  threshold: number | null | undefined,
  operator: TriggerComparisonOperatorValue | null | undefined,
): LiveConditionState {
  if (liveValue === null || liveValue === undefined || threshold === null || threshold === undefined) {
    return 'NO_DATA';
  }
  const exceeded = (value: number): boolean => {
    switch (operator) {
      case 'GREATER_THAN':
        return value > threshold;
      case 'GREATER_THAN_OR_EQUAL':
        return value >= threshold;
      case 'LESS_THAN':
        return value < threshold;
      case 'LESS_THAN_OR_EQUAL':
        return value <= threshold;
      case 'EQUAL':
        return value === threshold;
      default:
        return value > threshold;
    }
  };
  if (exceeded(liveValue)) return 'THRESHOLD_EXCEEDED';
  const approaching = (value: number): boolean => {
    const delta = Math.abs(value - threshold);
    const denom = Math.abs(threshold) || 1;
    switch (operator) {
      case 'GREATER_THAN':
      case 'GREATER_THAN_OR_EQUAL':
      case 'LESS_THAN':
      case 'LESS_THAN_OR_EQUAL':
        return delta / denom <= 0.1;
      default:
        return delta / denom <= 0.05;
    }
  };
  if (approaching(liveValue)) return 'APPROACHING';
  return 'NORMAL';
}

export const LIVE_CONDITION_STATE_LABELS: Record<LiveConditionState, string> = {
  NO_DATA: 'No live data',
  NORMAL: 'Within threshold',
  APPROACHING: 'Approaching threshold',
  THRESHOLD_EXCEEDED: 'Threshold exceeded',
};

export const LIVE_CONDITION_STATE_COLORS: Record<LiveConditionState, string> = {
  NO_DATA: 'bg-gray-100 text-gray-700',
  NORMAL: 'bg-success-50 text-success-700',
  APPROACHING: 'bg-warn-50 text-warn-700',
  THRESHOLD_EXCEEDED: 'bg-danger-50 text-danger-700',
};

export function liveConditionProgress(
  condition: LiveCondition,
): { percent: number; color: string } {
  const value = condition.liveValue;
  const threshold = condition.condition.thresholdValue;
  if (value === null || value === undefined || threshold === null || threshold === undefined) {
    return { percent: 0, color: 'bg-gray-200' };
  }
  const percent = Math.min(100, Math.max(0, (value / threshold) * 100));
  const state = condition.state;
  if (state === 'THRESHOLD_EXCEEDED') return { percent: 100, color: 'bg-danger-500' };
  if (state === 'APPROACHING') return { percent: Math.min(100, percent), color: 'bg-warn-500' };
  return { percent: Math.min(100, percent), color: 'bg-brand-500' };
}