import { TriggerEventResponse } from '../../dtos/trigger-events/trigger-event-response.dto';
import { selectFilteredTriggerEvents } from './trigger-events.selectors';

function event(id: number, overrides: Partial<TriggerEventResponse>): TriggerEventResponse {
  return {
    id,
    eventReference: `EVT-${id}`,
    measurementType: 'RAINFALL',
    status: 'DETECTED',
    ...overrides,
  } as TriggerEventResponse;
}

describe('trigger events selectors', () => {
  const events = [
    event(1, { zoneName: 'Hyderabad Central Zone', perilCode: 'EXCESS_RAINFALL' }),
    event(2, { zoneName: 'Mumbai West Zone', measurementType: 'RIVER_LEVEL', status: 'VERIFIED', perilName: 'Flood' }),
    event(3, { definitionCode: 'P1_CHENNAI_EAST_RAINFALL', status: 'REJECTED' }),
  ];

  it('returns every event for a blank search', () => {
    expect(selectFilteredTriggerEvents.projector(events, '  ').length).toBe(3);
  });

  it('searches reference, zone, peril, definition, measurement and status', () => {
    expect(selectFilteredTriggerEvents.projector(events, 'evt-2').map((e) => e.id)).toEqual([2]);
    expect(selectFilteredTriggerEvents.projector(events, 'hyderabad').map((e) => e.id)).toEqual([1]);
    expect(selectFilteredTriggerEvents.projector(events, 'flood').map((e) => e.id)).toEqual([2]);
    expect(selectFilteredTriggerEvents.projector(events, 'chennai').map((e) => e.id)).toEqual([3]);
    expect(selectFilteredTriggerEvents.projector(events, 'river').map((e) => e.id)).toEqual([2]);
    expect(selectFilteredTriggerEvents.projector(events, 'rejected').map((e) => e.id)).toEqual([3]);
  });
});
