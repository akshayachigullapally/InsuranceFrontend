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

  it('phrases "below" triggers such as drought', () => {
    expect(
      sentence({ measurementType: 'SOIL_MOISTURE', measurementUnit: '%', aggregationType: 'AVERAGE', comparisonOperator: 'LESS_THAN', thresholdValue: 15, observationWindowHours: 168 }),
    ).toBe('Average soil moisture of less than 15 % within 7 days');
  });
});
