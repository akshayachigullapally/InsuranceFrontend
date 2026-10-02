import { buildTriggerSentence } from './trigger-display';
import { TriggerCondition } from '../dtos/triggers/trigger-condition.dto';

function sentence(overrides: Partial<TriggerCondition>): string {
  return buildTriggerSentence({
    measurementType: 'RAINFALL',
    measurementUnit: 'mm',
    aggregationType: 'SUM',
    comparisonOperator: 'GREATER_THAN_OR_EQUAL',
    thresholdValue: 150,
    observationWindowHours: 24,
    ...overrides,
  } as TriggerCondition);
}

describe('buildTriggerSentence', () => {
  it('reads like a sentence a customer would say', () => {
    expect(sentence({})).toBe('Total rainfall of 150 mm or more within 24 hours');
  });

  it('describes maximum water level over hours', () => {
    expect(
      sentence({ measurementType: 'WATER_LEVEL', measurementUnit: 'm', aggregationType: 'MAX', thresholdValue: 5, observationWindowHours: 6 }),
    ).toBe('Maximum water level of 5 m or more within 6 hours');
  });

  it('uses days for whole-day windows longer than a day', () => {
    expect(
      sentence({ measurementType: 'TEMPERATURE', measurementUnit: '°C', aggregationType: 'MAX', thresholdValue: 45, observationWindowHours: 72 }),
    ).toBe('Maximum temperature of 45 °C or more within 3 days');
  });

  it('phrases "below" triggers such as drought', () => {
    expect(
      sentence({ measurementType: 'SOIL_MOISTURE', measurementUnit: '%', aggregationType: 'AVERAGE', comparisonOperator: 'LESS_THAN', thresholdValue: 15, observationWindowHours: 168 }),
    ).toBe('Average soil moisture of less than 15 % within 7 days');
  });

  it('prefers the description written for the product', () => {
    expect(sentence({ humanReadableTrigger: 'Heavy rain cover' } as Partial<TriggerCondition>)).toBe('Heavy rain cover');
  });

  it('says when no threshold is configured', () => {
    expect(sentence({ thresholdValue: null } as Partial<TriggerCondition>)).toBe('Trigger condition not configured');
  });
});
