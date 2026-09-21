import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TriggerEventsState } from './trigger-events.state';

const selectTriggerEventsState = createFeatureSelector<TriggerEventsState>('triggerEvents');

export const selectTriggerEvents = createSelector(
  selectTriggerEventsState,
  state => state.events,
);

export const selectSelectedTriggerEvent = createSelector(
  selectTriggerEventsState,
  state => state.selectedEvent,
);

export const selectTriggerEventsSearch = createSelector(
  selectTriggerEventsState,
  state => state.search,
);

export const selectTriggerEventsLoading = createSelector(
  selectTriggerEventsState,
  state => state.isLoading,
);

export const selectTriggerEventsSaving = createSelector(
  selectTriggerEventsState,
  state => state.isSaving,
);

export const selectUpdatingTriggerEventId = createSelector(
  selectTriggerEventsState,
  state => state.updatingEventId,
);

export const selectTriggerEventsError = createSelector(
  selectTriggerEventsState,
  state => state.error,
);

export const selectFilteredTriggerEvents = createSelector(
  selectTriggerEvents,
  selectTriggerEventsSearch,
  (events, search) => {
    const value = search.trim().toLowerCase();

    if (!value) return events;

    return events.filter(evt =>
      evt.eventReference.toLowerCase().includes(value) ||
      evt.definitionCode?.toLowerCase().includes(value) === true ||
      evt.definitionName?.toLowerCase().includes(value) === true ||
      evt.perilCode?.toLowerCase().includes(value) === true ||
      evt.perilName?.toLowerCase().includes(value) === true ||
      evt.zoneCode?.toLowerCase().includes(value) === true ||
      evt.zoneName?.toLowerCase().includes(value) === true ||
      evt.measurementType.toLowerCase().includes(value) ||
      evt.status.toLowerCase().includes(value),
    );
  },
);

export const selectDetectedEventCount = createSelector(
  selectTriggerEvents,
  events => events.filter(e => e.status === 'DETECTED').length,
);

export const selectVerifiedEventCount = createSelector(
  selectTriggerEvents,
  events => events.filter(e => e.status === 'VERIFIED').length,
);
