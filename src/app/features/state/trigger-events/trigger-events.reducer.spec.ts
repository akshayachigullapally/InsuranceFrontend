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

  it('loads events', () => {
    const loading = triggerEventsReducer(initialTriggerEventsState, TriggerEventsActions.loadTriggerEvents());
    expect(loading.isLoading).toBe(true);

    const loaded = triggerEventsReducer(loading, TriggerEventsActions.loadTriggerEventsSuccess({ events: [makeEvent(1)] }));
    expect(loaded.events.length).toBe(1);
    expect(loaded.isLoading).toBe(false);
  });

  it('stores load failures', () => {
    const state = triggerEventsReducer(
      initialTriggerEventsState,
      TriggerEventsActions.loadTriggerEventsFailure({ error: 'Down' }),
    );

    expect(state.error).toBe('Down');
  });

  it('updates the list when a single event loads', () => {
    const current: TriggerEventsState = { ...initialTriggerEventsState, events: [makeEvent(1)] };
    const verified = makeEvent(1, 'VERIFIED');

    const state = triggerEventsReducer(current, TriggerEventsActions.loadTriggerEventSuccess({ event: verified }));

    expect(state.selectedEvent).toEqual(verified);
    expect(state.events[0].status).toBe('VERIFIED');
  });

  it('does not create a list when a single event loads into an empty list', () => {
    const state = triggerEventsReducer(
      initialTriggerEventsState,
      TriggerEventsActions.loadTriggerEventSuccess({ event: makeEvent(2) }),
    );

    expect(state.events).toEqual([]);
  });

  it('sets and clears the search term', () => {
    const searched = triggerEventsReducer(
      initialTriggerEventsState,
      TriggerEventsActions.setTriggerEventsSearch({ search: 'rain' }),
    );
    expect(searched.search).toBe('rain');

    expect(triggerEventsReducer(searched, TriggerEventsActions.clearTriggerEventFilters()).search).toBe('');
  });
});
