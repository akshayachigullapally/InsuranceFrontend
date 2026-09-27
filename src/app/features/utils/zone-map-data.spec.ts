import { buildMapZones, MapInputs } from './zone-map-data';

function inputs(): MapInputs {
  return {
    zones: [
      { id: 100, zoneName: 'River Zone', zoneCode: 'RZ', latitude: 17.4, longitude: 78.5, radiusKm: 8, status: 'ACTIVE' },
      { id: 200, zoneName: 'City Zone', zoneCode: 'CZ', latitude: 17.3, longitude: 78.4, radiusKm: 5, status: 'ACTIVE' },
      { id: 300, zoneName: 'Old Zone', zoneCode: 'OZ', latitude: 17.2, longitude: 78.3, radiusKm: 5, status: 'ARCHIVED' },
    ],
    products: [
      { id: 10, name: 'Flood', status: 'ACTIVE', measurementType: 'WATER_LEVEL', thresholdValue: 5, comparisonOperator: 'GREATER_THAN_OR_EQUAL' },
      { id: 20, name: 'Rain', status: 'ACTIVE', measurementType: 'RAINFALL', thresholdValue: 150, comparisonOperator: 'GREATER_THAN_OR_EQUAL' },
      { id: 30, name: 'Draft', status: 'DRAFT', measurementType: 'RAINFALL', thresholdValue: 10, comparisonOperator: 'GREATER_THAN_OR_EQUAL' },
    ],
    readings: [
      { locationZoneId: 100, measurementType: 'WATER_LEVEL', measurementUnit: 'METER', currentValue: 5.4 },
      { locationZoneId: 100, measurementType: 'RAINFALL', measurementUnit: 'MM', currentValue: 20 },
      { locationZoneId: 200, measurementType: 'RAINFALL', measurementUnit: 'MM', currentValue: 40 },
      { locationZoneId: 200, measurementType: 'TEMPERATURE', measurementUnit: 'CELSIUS', currentValue: 31 },
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

  it('checks each reading against active products that use its measurement', () => {
    const river = buildMapZones(inputs()).find(zone => zone.zoneId === 100)!;
    const water = river.readings.find(reading => reading.measurementType === 'WATER_LEVEL')!;
    const rain = river.readings.find(reading => reading.measurementType === 'RAINFALL')!;

    expect(water.label).toBe('Water Level');
    expect(water.unit).toBe('m');
    expect(water.triggers).toEqual([{ productName: 'Flood', thresholdText: '≥ 5', state: 'THRESHOLD_EXCEEDED' }]);
    expect(rain.triggers.map(trigger => trigger.productName)).toEqual(['Rain']);
  });

  it('shows readings no product watches as normal data, not missing data', () => {
    const city = buildMapZones(inputs()).find(zone => zone.zoneId === 200)!;
    const temperature = city.readings.find(reading => reading.measurementType === 'TEMPERATURE')!;

    expect(temperature.triggers).toEqual([]);
    expect(temperature.state).toBe('NORMAL');
  });

  it('has no financial figures', () => {
    const zone = buildMapZones(inputs())[0] as unknown as Record<string, unknown>;

    expect(Object.keys(zone)).not.toContain('premiums');
    expect(Object.keys(zone)).not.toContain('payouts');
    expect(Object.keys(zone)).not.toContain('lossRatio');
  });
});
