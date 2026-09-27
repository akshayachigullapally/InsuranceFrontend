import { PaymentResponse } from '../dtos/financial/payment-response.dto';
import { PayoutResponse } from '../dtos/financial/payout-response.dto';
import { PolicyResponse } from '../dtos/policies/policy-response.dto';
import { ProductResponse } from '../dtos/products/product-response.dto';
import { CurrentMeasurementSnapshot } from '../dtos/triggers/current-measurement.dto';
import { LiveConditionState } from '../dtos/triggers/trigger-condition.dto';
import { ZoneResponse } from '../dtos/zones/zone-response.dto';
import { liveConditionState } from './trigger-display';

/** Premiums collected vs payouts made, plus what is still at risk. */
export interface RiskFigures {
  activePolicies: number;
  /** Sum insured of active policies: the most that could be paid if every policy triggered. */
  exposure: number;
  premiums: number;
  payouts: number;
  /** Approved payouts not yet completed (pending, processing or failed). */
  outstandingPayouts: number;
  /** payouts / premiums; null when no premium has been collected. */
  lossRatio: number | null;
}

export interface ProductRisk extends RiskFigures {
  productId: number;
  productName: string;
  productCode: string;
}

export interface ZoneReading {
  productId: number;
  productName: string;
  measurementType: string;
  measurementUnit: string;
  currentValue: number;
  thresholdValue: number | null;
  comparisonOperator: string | null;
  state: LiveConditionState;
  recordedAt: string | null;
}

export interface ZoneRisk extends RiskFigures {
  zoneId: number;
  zoneName: string;
  zoneCode: string;
  latitude: number | null;
  longitude: number | null;
  radiusKm: number | null;
  readings: ZoneReading[];
  /** Worst live condition across the zone's readings. */
  state: LiveConditionState;
}

export interface RiskSummary {
  totals: RiskFigures;
  byProduct: ProductRisk[];
  byZone: ZoneRisk[];
  triggeredZones: number;
  approachingZones: number;
}

export interface RiskInputs {
  policies: PolicyResponse[];
  payments: PaymentResponse[];
  payouts: PayoutResponse[];
  products: ProductResponse[];
  zones: ZoneResponse[];
  measurements: CurrentMeasurementSnapshot[];
}

const STATE_RANK: Record<LiveConditionState, number> = {
  NO_DATA: 0,
  NORMAL: 1,
  APPROACHING: 2,
  THRESHOLD_EXCEEDED: 3,
};

function emptyFigures(): RiskFigures {
  return {
    activePolicies: 0,
    exposure: 0,
    premiums: 0,
    payouts: 0,
    outstandingPayouts: 0,
    lossRatio: null,
  };
}

function finish<T extends RiskFigures>(figures: T): T {
  figures.lossRatio = figures.premiums > 0 ? figures.payouts / figures.premiums : null;
  return figures;
}

export function buildRiskSummary(input: RiskInputs): RiskSummary {
  const policyById = new Map(input.policies.map(policy => [policy.id, policy]));
  const productById = new Map(input.products.map(product => [product.id, product]));
  const zoneById = new Map(input.zones.map(zone => [zone.id, zone]));

  const totals = emptyFigures();
  const byProduct = new Map<number, ProductRisk>();
  const byZone = new Map<number, ZoneRisk>();

  const productBucket = (productId: number): ProductRisk => {
    let bucket = byProduct.get(productId);
    if (!bucket) {
      const product = productById.get(productId);
      const policy = input.policies.find(p => p.productId === productId);
      bucket = {
        ...emptyFigures(),
        productId,
        productName: product?.name ?? policy?.productName ?? `Product #${productId}`,
        productCode: product?.productCode ?? policy?.productCode ?? '',
      };
      byProduct.set(productId, bucket);
    }
    return bucket;
  };

  const zoneBucket = (zoneId: number): ZoneRisk => {
    let bucket = byZone.get(zoneId);
    if (!bucket) {
      const zone = zoneById.get(zoneId);
      bucket = {
        ...emptyFigures(),
        zoneId,
        zoneName: zone?.zoneName ?? `Zone #${zoneId}`,
        zoneCode: zone?.zoneCode ?? '',
        latitude: zone?.latitude ?? null,
        longitude: zone?.longitude ?? null,
        radiusKm: zone?.radiusKm ?? null,
        readings: [],
        state: 'NO_DATA',
      };
      byZone.set(zoneId, bucket);
    }
    return bucket;
  };

  // Every known zone appears on the map, even without policies.
  input.zones.filter(zone => zone.status !== 'ARCHIVED').forEach(zone => zoneBucket(zone.id));

  for (const policy of input.policies) {
    if (policy.status !== 'ACTIVE') {
      continue;
    }
    const sumInsured = Number(policy.sumInsured) || 0;
    for (const bucket of [totals, productBucket(policy.productId), zoneBucket(policy.locationZoneId)]) {
      bucket.activePolicies += 1;
      bucket.exposure += sumInsured;
    }
  }

  for (const payment of input.payments) {
    if (payment.status !== 'SUCCESS') {
      continue;
    }
    const amount = Number(payment.amount) || 0;
    const policy = policyById.get(payment.policyId);
    totals.premiums += amount;
    if (policy) {
      productBucket(policy.productId).premiums += amount;
      zoneBucket(policy.locationZoneId).premiums += amount;
    }
  }

  for (const payout of input.payouts) {
    const amount = Number(payout.amount) || 0;
    const policy = policyById.get(payout.policyId);
    const buckets: RiskFigures[] = [totals];
    if (policy) {
      buckets.push(productBucket(policy.productId), zoneBucket(policy.locationZoneId));
    }
    for (const bucket of buckets) {
      if (payout.status === 'SUCCESS') {
        bucket.payouts += amount;
      } else {
        bucket.outstandingPayouts += amount;
      }
    }
  }

  for (const measurement of input.measurements) {
    if (measurement.productId === null || measurement.productId === undefined) {
      continue;
    }
    const product = productById.get(measurement.productId);
    const zone = zoneBucket(measurement.locationZoneId);
    const threshold = product?.thresholdValue ?? null;
    const operator = product?.comparisonOperator ?? null;
    const state = liveConditionState(Number(measurement.currentValue), threshold, operator);
    zone.readings.push({
      productId: measurement.productId,
      productName: product?.name ?? `Product #${measurement.productId}`,
      measurementType: measurement.measurementType,
      measurementUnit: measurement.measurementUnit,
      currentValue: Number(measurement.currentValue),
      thresholdValue: threshold,
      comparisonOperator: operator,
      state,
      recordedAt: measurement.updatedAt ?? measurement.recordedAt ?? null,
    });
    if (STATE_RANK[state] > STATE_RANK[zone.state]) {
      zone.state = state;
    }
  }

  const zones = [...byZone.values()].map(finish)
    .sort((a, b) => b.exposure - a.exposure || a.zoneName.localeCompare(b.zoneName));
  const products = [...byProduct.values()].map(finish)
    .sort((a, b) => b.exposure - a.exposure || a.productName.localeCompare(b.productName));

  return {
    totals: finish(totals),
    byProduct: products,
    byZone: zones,
    triggeredZones: zones.filter(zone => zone.state === 'THRESHOLD_EXCEEDED').length,
    approachingZones: zones.filter(zone => zone.state === 'APPROACHING').length,
  };
}

/** Colour band for a loss ratio: under 60% healthy, 60-100% watch, over 100% losing money. */
export function lossRatioBand(ratio: number | null): 'none' | 'good' | 'watch' | 'bad' {
  if (ratio === null) return 'none';
  if (ratio < 0.6) return 'good';
  if (ratio <= 1) return 'watch';
  return 'bad';
}
