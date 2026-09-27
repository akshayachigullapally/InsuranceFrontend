import { buildMapZones, MapInputs } from './zone-map-data';

function inputs(): MapInputs {
  return {
    zones: [
      { id: 100, zoneName: 'River Zone', zoneCode: 'RZ', latitude: 17.4, longitude: 78.5, radiusKm: 8, status: 'ACTIVE' },
      { id: 200, zoneName: 'City Zone', zoneCode: 'CZ', latitude: 17.3, longitude: 78.4, radiusKm: 5, status: 'ACTIVE' },
      { id: 300, zoneName: 'Old Zone', zoneCode: 'OZ', latitude: 17.2, longitude: 78.3, radiusKm: 5, status: 'ARCHIVED' },
    ],
    products: [
      { id: 10, name: 'Flood', thresholdValue: 5, comparisonOperator: 'GREATER_THAN_OR_EQUAL' },
      { id: 20, name: 'Rain', thresholdValue: 150, comparisonOperator: 'GREATER_THAN_OR_EQUAL' },
    ],
    measurements: [
      { productId: 10, locationZoneId: 100, measurementType: 'WATER_LEVEL', measurementUnit: 'm', currentValue: 5.4 },
      { productId: 20, locationZoneId: 200, measurementType: 'RAINFALL', measurementUnit: 'mm', currentValue: 40 },
    ],
    policies: [
      { id: 1, policyNumber: 'POL-1', locationZoneId: 200, status: 'ACTIVE' },
      { id: 2, policyNumber: 'POL-2', locationZoneId: 200, status: 'PENDING' },
    ],
  } as unknown as MapInputs;
}

describe('buildMapZones', () => {
  it('rates each zone by its live readings against trigger thresholds', () => {
    const zones = buildMapZones(inputs());

    expect(zones.find(zone => zone.zoneId === 100)!.state).toBe('THRESHOLD_EXCEEDED');
    expect(zones.find(zone => zone.zoneId === 200)!.state).toBe('NORMAL');
  });

  it('lists triggered zones first and skips archived zones', () => {
    const zones = buildMapZones(inputs());

    expect(zones.map(zone => zone.zoneId)).toEqual([100, 200]);
  });

  it('counts only active policies per zone', () => {
    const city = buildMapZones(inputs()).find(zone => zone.zoneId === 200)!;

    expect(city.activePolicies).toBe(1);
    expect(city.policyNumbers).toEqual(['POL-1']);
  });

  it('has no financial figures', () => {
    const zone = buildMapZones(inputs())[0] as unknown as Record<string, unknown>;

    expect(Object.keys(zone)).not.toContain('premiums');
    expect(Object.keys(zone)).not.toContain('payouts');
    expect(Object.keys(zone)).not.toContain('lossRatio');
  });
});
