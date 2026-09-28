import { PolicyResponse } from '../dtos/policies/policy-response.dto';
import { ProductResponse } from '../dtos/products/product-response.dto';
import { ZoneMeasurement } from '../dtos/triggers/current-measurement.dto';
import { LiveConditionState } from '../dtos/triggers/trigger-condition.dto';
import { ZoneResponse } from '../dtos/zones/zone-response.dto';
import {
  comparisonOperatorSymbol,
  liveConditionState,
  measurementTypeLabel,
  measurementUnitLabel,
  normalizeMeasurementType,
} from './trigger-display';

/** A product trigger that uses the reading's measurement type. */
interface ReadingTrigger {
  productName: string;
  /** e.g. "≥ 150" */
  thresholdText: string;
  state: LiveConditionState;
}

/** Latest reading of one measurement type in a zone, checked against product thresholds. */
export interface ZoneReading {
  measurementType: string;
  label: string;
  unit: string;
  currentValue: number;
  observedAt: string | null;
  triggers: ReadingTrigger[];
  /** Worst state across the triggers; NORMAL when no product uses this measurement. */
  state: LiveConditionState;
}

/** One zone on the map: where it is and how its live readings compare with trigger thresholds. */
export interface MapZone {
  zoneId: number;
  zoneName: string;
  zoneCode: string;
  latitude: number | null;
  longitude: number | null;
  radiusKm: number | null;
  readings: ZoneReading[];
  /** Worst live condition across the zone's readings. */
  state: LiveConditionState;
  /** Active policies in the zone (all customers for admin, the customer's own otherwise). */
  activePolicies: number;
  /** Policy numbers shown in the popup (customer view). */
  policyNumbers: string[];
}

export interface MapInputs {
  zones: ZoneResponse[];
  products: ProductResponse[];
  readings: ZoneMeasurement[];
  policies: PolicyResponse[];
}

const STATE_RANK: Record<LiveConditionState, number> = {
  NO_DATA: 0,
  NORMAL: 1,
  APPROACHING: 2,
  THRESHOLD_EXCEEDED: 3,
};

function worst(states: LiveConditionState[], fallback: LiveConditionState): LiveConditionState {
  return states.reduce(
    (current, state) => (STATE_RANK[state] > STATE_RANK[current] ? state : current),
    fallback,
  );
}

export function buildMapZones(input: MapInputs): MapZone[] {
  // Thresholds of live products, grouped by the measurement type they watch.
  const productsByType = new Map<string, ProductResponse[]>();
  for (const product of input.products) {
    if (
      product.status !== 'ACTIVE' ||
      product.thresholdValue === null ||
      product.thresholdValue === undefined
    ) {
      continue;
    }
    const type = normalizeMeasurementType(product.measurementType);
    if (!type) {
      continue;
    }
    productsByType.set(type, [...(productsByType.get(type) ?? []), product]);
  }

  const byZone = new Map<number, MapZone>();
  for (const zone of input.zones) {
    if (zone.status === 'ARCHIVED') {
      continue;
    }
    byZone.set(zone.id, {
      zoneId: zone.id,
      zoneName: zone.zoneName,
      zoneCode: zone.zoneCode,
      latitude: zone.latitude ?? null,
      longitude: zone.longitude ?? null,
      radiusKm: zone.radiusKm ?? null,
      readings: [],
      state: 'NO_DATA',
      activePolicies: 0,
      policyNumbers: [],
    });
  }

  for (const policy of input.policies) {
    const zone = byZone.get(policy.locationZoneId);
    if (zone && policy.status === 'ACTIVE') {
      zone.activePolicies += 1;
      zone.policyNumbers.push(policy.policyNumber);
    }
  }

  for (const reading of input.readings) {
    const zone = byZone.get(reading.locationZoneId);
    if (!zone) {
      continue;
    }
    const value = Number(reading.currentValue);
    const type = normalizeMeasurementType(reading.measurementType);
    const triggers: ReadingTrigger[] = (productsByType.get(type) ?? []).map((product) => ({
      productName: product.name,
      thresholdText: `${comparisonOperatorSymbol(product.comparisonOperator ?? 'GREATER_THAN_OR_EQUAL')} ${product.thresholdValue}`,
      state: liveConditionState(value, product.thresholdValue, product.comparisonOperator ?? null),
    }));
    const state = worst(
      triggers.map((trigger) => trigger.state),
      'NORMAL',
    );
    zone.readings.push({
      measurementType: type,
      label: measurementTypeLabel(reading.measurementType),
      unit: measurementUnitLabel(reading.measurementUnit),
      currentValue: value,
      observedAt: reading.observedAt ?? null,
      triggers,
      state,
    });
    zone.state = worst([zone.state, state], zone.state);
  }

  for (const zone of byZone.values()) {
    zone.readings.sort((a, b) => a.label.localeCompare(b.label));
  }

  return [...byZone.values()].sort(
    (a, b) =>
      STATE_RANK[b.state] - STATE_RANK[a.state] ||
      b.activePolicies - a.activePolicies ||
      a.zoneName.localeCompare(b.zoneName),
  );
}
