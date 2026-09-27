import { buildRiskSummary, lossRatioBand, RiskInputs } from './risk-metrics';

function inputs(overrides: Partial<RiskInputs> = {}): RiskInputs {
  return {
    policies: [
      { id: 1, productId: 10, locationZoneId: 100, status: 'ACTIVE', sumInsured: 50000, productName: 'Flood', productCode: 'FLOOD-001' },
      { id: 2, productId: 10, locationZoneId: 100, status: 'ACTIVE', sumInsured: 30000, productName: 'Flood', productCode: 'FLOOD-001' },
      { id: 3, productId: 20, locationZoneId: 200, status: 'ACTIVE', sumInsured: 20000, productName: 'Rain', productCode: 'WEATHER-001' },
      { id: 4, productId: 20, locationZoneId: 200, status: 'PENDING', sumInsured: 99999, productName: 'Rain', productCode: 'WEATHER-001' },
    ],
    payments: [
      { id: 1, policyId: 1, amount: 1000, status: 'SUCCESS' },
      { id: 2, policyId: 3, amount: 500, status: 'SUCCESS' },
      { id: 3, policyId: 2, amount: 800, status: 'FAILED' },
    ],
    payouts: [
      { id: 1, policyId: 1, amount: 1500, status: 'SUCCESS' },
      { id: 2, policyId: 3, amount: 200, status: 'PENDING' },
    ],
    products: [
      { id: 10, name: 'Flood', productCode: 'FLOOD-001', thresholdValue: 5, comparisonOperator: 'GREATER_THAN_OR_EQUAL' },
      { id: 20, name: 'Rain', productCode: 'WEATHER-001', thresholdValue: 150, comparisonOperator: 'GREATER_THAN_OR_EQUAL' },
    ],
    zones: [
      { id: 100, zoneName: 'River Zone', zoneCode: 'RZ', latitude: 17.4, longitude: 78.5, radiusKm: 8, status: 'ACTIVE' },
      { id: 200, zoneName: 'City Zone', zoneCode: 'CZ', latitude: 17.3, longitude: 78.4, radiusKm: 5, status: 'ACTIVE' },
      { id: 300, zoneName: 'Old Zone', zoneCode: 'OZ', latitude: 17.2, longitude: 78.3, radiusKm: 5, status: 'ARCHIVED' },
    ],
    measurements: [
      { productId: 10, locationZoneId: 100, measurementType: 'WATER_LEVEL', measurementUnit: 'm', currentValue: 5.4 },
      { productId: 20, locationZoneId: 200, measurementType: 'RAINFALL', measurementUnit: 'mm', currentValue: 40 },
    ],
    ...overrides,
  } as unknown as RiskInputs;
}

describe('buildRiskSummary', () => {
  it('computes totals from active policies, successful payments and payouts', () => {
    const summary = buildRiskSummary(inputs());

    expect(summary.totals.activePolicies).toBe(3);
    expect(summary.totals.exposure).toBe(100000);
    expect(summary.totals.premiums).toBe(1500);
    expect(summary.totals.payouts).toBe(1500);
    expect(summary.totals.outstandingPayouts).toBe(200);
    expect(summary.totals.lossRatio).toBe(1);
  });

  it('breaks figures down by product and by zone', () => {
    const summary = buildRiskSummary(inputs());
    const flood = summary.byProduct.find(p => p.productId === 10)!;
    const river = summary.byZone.find(z => z.zoneId === 100)!;
    const city = summary.byZone.find(z => z.zoneId === 200)!;

    expect(flood.exposure).toBe(80000);
    expect(flood.lossRatio).toBe(1.5);
    expect(river.activePolicies).toBe(2);
    expect(city.lossRatio).toBe(0);
    expect(summary.byZone.map(z => z.zoneId)).not.toContain(300);
  });

  it('rates zones by live readings against product thresholds', () => {
    const summary = buildRiskSummary(inputs());

    expect(summary.byZone.find(z => z.zoneId === 100)!.state).toBe('THRESHOLD_EXCEEDED');
    expect(summary.byZone.find(z => z.zoneId === 200)!.state).toBe('NORMAL');
    expect(summary.triggeredZones).toBe(1);
  });

  it('has no loss ratio without premiums', () => {
    const summary = buildRiskSummary(inputs({ payments: [] }));

    expect(summary.totals.lossRatio).toBeNull();
  });
});

describe('lossRatioBand', () => {
  it('bands ratios', () => {
    expect(lossRatioBand(null)).toBe('none');
    expect(lossRatioBand(0.3)).toBe('good');
    expect(lossRatioBand(0.8)).toBe('watch');
    expect(lossRatioBand(1.2)).toBe('bad');
  });
});
