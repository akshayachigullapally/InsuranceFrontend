import { PolicyResponse } from '../dtos/policies/policy-response.dto';
import { ProductResponse } from '../dtos/products/product-response.dto';
import { CurrentMeasurementSnapshot } from '../dtos/triggers/current-measurement.dto';
import { LiveConditionState } from '../dtos/triggers/trigger-condition.dto';
import { ZoneResponse } from '../dtos/zones/zone-response.dto';
import { liveConditionState } from './trigger-display';

export interface ZoneReading {
  productId: number;
  productName: string;
  measurementUnit: string;
  currentValue: number;
  thresholdValue: number | null;
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
  measurements: CurrentMeasurementSnapshot[];
  policies: PolicyResponse[];
}

const STATE_RANK: Record<LiveConditionState, number> = {
  NO_DATA: 0,
  NORMAL: 1,
  APPROACHING: 2,
  THRESHOLD_EXCEEDED: 3,
};

export function buildMapZones(input: MapInputs): MapZone[] {
  const productById = new Map(input.products.map(product => [product.id, product]));
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

  for (const measurement of input.measurements) {
    const zone = byZone.get(measurement.locationZoneId);
    if (!zone || measurement.productId === null || measurement.productId === undefined) {
      continue;
    }
    const product = productById.get(measurement.productId);
    const threshold = product?.thresholdValue ?? null;
    const state = liveConditionState(Number(measurement.currentValue), threshold, product?.comparisonOperator ?? null);
    zone.readings.push({
      productId: measurement.productId,
      productName: product?.name ?? `Product #${measurement.productId}`,
      measurementUnit: measurement.measurementUnit,
      currentValue: Number(measurement.currentValue),
      thresholdValue: threshold,
      state,
    });
    if (STATE_RANK[state] > STATE_RANK[zone.state]) {
      zone.state = state;
    }
  }

  return [...byZone.values()].sort((a, b) =>
    STATE_RANK[b.state] - STATE_RANK[a.state] ||
    b.activePolicies - a.activePolicies ||
    a.zoneName.localeCompare(b.zoneName));
}
