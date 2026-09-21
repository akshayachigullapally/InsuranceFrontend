import { Action, createReducer, on } from '@ngrx/store';
import { TriggerEventResponse } from '../../dtos/trigger-events/trigger-event-response.dto';
import {
  clearSelectedTriggerEvent,
  clearTriggerEventFilters,
  clearTriggerEventsError,
  loadTriggerEvent,
  loadTriggerEventFailure,
  loadTriggerEventSuccess,
  loadTriggerEvents,
  loadTriggerEventsFailure,
  loadTriggerEventsSuccess,
  rejectTriggerEvent,
  rejectTriggerEventFailure,
  rejectTriggerEventSuccess,
  setTriggerEventsSearch,
  startValidation,
  startValidationFailure,
  startValidationSuccess,
  verifyTriggerEvent,
  verifyTriggerEventFailure,
  verifyTriggerEventSuccess,
} from './trigger-events.actions';
import { initialTriggerEventsState, TriggerEventsState } from './trigger-events.state';

function upsert(events: TriggerEventResponse[], event: TriggerEventResponse): TriggerEventResponse[] {
  return events.some(item => item.id === event.id)
    ? events.map(item => item.id === event.id ? event : item)
    : [event, ...events];
}

export const triggerEventsReducer = createReducer(
  initialTriggerEventsState,

  on(loadTriggerEvents, (state): TriggerEventsState => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(loadTriggerEventsSuccess, (state, { events }): TriggerEventsState => ({
    ...state,
    events,
    isLoading: false,
  })),

  on(loadTriggerEventsFailure, (state, { error }): TriggerEventsState => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(loadTriggerEvent, (state): TriggerEventsState => ({
    ...state,
    selectedEvent: null,
    isLoading: true,
    error: null,
  })),

  on(loadTriggerEventSuccess, (state, { event }): TriggerEventsState => ({
    ...state,
    selectedEvent: event,
    events: state.events.length ? upsert(state.events, event) : state.events,
    isLoading: false,
  })),

  on(loadTriggerEventFailure, (state, { error }): TriggerEventsState => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(
    startValidation,
    verifyTriggerEvent,
    rejectTriggerEvent,
    (state, { eventId }): TriggerEventsState => ({
      ...state,
      isSaving: true,
      updatingEventId: eventId,
      error: null,
    }),
  ),

  on(
    startValidationSuccess,
    verifyTriggerEventSuccess,
    rejectTriggerEventSuccess,
    (state, { event }): TriggerEventsState => ({
      ...state,
      events: upsert(state.events, event),
      selectedEvent:
        state.selectedEvent?.id === event.id ? event : state.selectedEvent,
      isSaving: false,
      updatingEventId: null,
    }),
  ),

  on(
    startValidationFailure,
    verifyTriggerEventFailure,
    rejectTriggerEventFailure,
    (state, { error }): TriggerEventsState => ({
      ...state,
      isSaving: false,
      updatingEventId: null,
      error,
    }),
  ),

  on(setTriggerEventsSearch, (state, { search }): TriggerEventsState => ({
    ...state,
    search,
  })),

  on(clearTriggerEventFilters, (state): TriggerEventsState => ({
    ...state,
    search: '',
  })),

  on(clearSelectedTriggerEvent, (state): TriggerEventsState => ({
    ...state,
    selectedEvent: null,
  })),

  on(clearTriggerEventsError, (state): TriggerEventsState => ({
    ...state,
    error: null,
  })),
);

export function reducer(
  state: TriggerEventsState | undefined,
  action: Action,
): TriggerEventsState {
  return triggerEventsReducer(state, action);
}
