import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ObservationsState } from './observations.state';

const selectObservationsState = createFeatureSelector<ObservationsState>('observations');

export const selectObservations = createSelector(
  selectObservationsState,
  state => state.observations,
);

export const selectSelectedObservation = createSelector(
  selectObservationsState,
  state => state.selectedObservation,
);

export const selectObservationsSearch = createSelector(
  selectObservationsState,
  state => state.search,
);

export const selectObservationsLoading = createSelector(
  selectObservationsState,
  state => state.isLoading,
);

export const selectObservationsSaving = createSelector(
  selectObservationsState,
  state => state.isSaving,
);

export const selectObservationsError = createSelector(
  selectObservationsState,
  state => state.error,
);

export const selectFilteredObservations = createSelector(
  selectObservations,
  selectObservationsSearch,
  (observations, search) => {
    const value = search.trim().toLowerCase();

    if (!value) return observations;

    return observations.filter(obs =>
      obs.observationReference.toLowerCase().includes(value) ||
      obs.measurementType.toLowerCase().includes(value) ||
      obs.source.toLowerCase().includes(value) ||
      obs.status.toLowerCase().includes(value) ||
      obs.locationZoneCode?.toLowerCase().includes(value) === true ||
      obs.locationZoneName?.toLowerCase().includes(value) === true,
    );
  },
);

export const selectValidatedObservationCount = createSelector(
  selectObservations,
  observations => observations.filter(obs => obs.status === 'VALIDATED').length,
);

export const selectReceivedObservationCount = createSelector(
  selectObservations,
  observations => observations.filter(obs => obs.status === 'RECEIVED').length,
);
