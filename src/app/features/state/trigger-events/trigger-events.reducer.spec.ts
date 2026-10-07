import { triggerEventsReducer } from './trigger-events.reducer';
import { initialTriggerEventsState, TriggerEventsState } from './trigger-events.state';
import * as TriggerEventsActions from './trigger-events.actions';
import { TriggerEventResponse } from '../../dtos/trigger-events/trigger-event-response.dto';

function makeEvent(id: number, status = 'DETECTED'): TriggerEventResponse {
  return { id, eventReference: `EVT-${id}`, status } as TriggerEventResponse;
}

describe('triggerEventsReducer', () => {
  it('returns the initial state for an unknown action', () => {
    expect(triggerEventsReducer(undefined, { type: '[Unknown]' } as never)).toEqual(initialTriggerEventsState);
  });

  it('updates the list when a single event loads', () => {
    const current: TriggerEventsState = { ...initialTriggerEventsState, events: [makeEvent(1)] };
    const verified = makeEvent(1, 'VERIFIED');

    const state = triggerEventsReducer(current, TriggerEventsActions.loadTriggerEventSuccess({ event: verified }));

    expect(state.selectedEvent).toEqual(verified);
    expect(state.events[0].status).toBe('VERIFIED');
  });
});
