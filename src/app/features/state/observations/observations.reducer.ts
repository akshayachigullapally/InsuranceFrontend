import { Action, createReducer, on } from '@ngrx/store';
import { ObservationResponse } from '../../dtos/observations/observation-response.dto';
import {
  clearObservationFilters,
  clearObservationsError,
  clearSelectedObservation,
  createObservation,
  createObservationFailure,
  createObservationSuccess,
  loadObservation,
  loadObservationFailure,
  loadObservationSuccess,
  loadObservations,
  loadObservationsFailure,
  loadObservationsSuccess,
  setObservationsSearch,
} from './observations.actions';
import { initialObservationsState, ObservationsState } from './observations.state';

function upsert(observations: ObservationResponse[], observation: ObservationResponse): ObservationResponse[] {
  return observations.some(item => item.id === observation.id)
    ? observations.map(item => item.id === observation.id ? observation : item)
    : [observation, ...observations];
}

export const observationsReducer = createReducer(
  initialObservationsState,

  on(loadObservations, (state): ObservationsState => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(loadObservationsSuccess, (state, { observations }): ObservationsState => ({
    ...state,
    observations,
    isLoading: false,
  })),

  on(loadObservationsFailure, (state, { error }): ObservationsState => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(loadObservation, (state): ObservationsState => ({
    ...state,
    selectedObservation: null,
    isLoading: true,
    error: null,
  })),

  on(loadObservationSuccess, (state, { observation }): ObservationsState => ({
    ...state,
    selectedObservation: observation,
    observations: state.observations.length
      ? upsert(state.observations, observation)
      : state.observations,
    isLoading: false,
  })),

  on(loadObservationFailure, (state, { error }): ObservationsState => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(createObservation, (state): ObservationsState => ({
    ...state,
    isSaving: true,
    error: null,
  })),

  on(createObservationSuccess, (state, { observation }): ObservationsState => ({
    ...state,
    observations: upsert(state.observations, observation),
    selectedObservation: observation,
    isSaving: false,
  })),

  on(createObservationFailure, (state, { error }): ObservationsState => ({
    ...state,
    isSaving: false,
    error,
  })),

  on(setObservationsSearch, (state, { search }): ObservationsState => ({
    ...state,
    search,
  })),

  on(clearObservationFilters, (state): ObservationsState => ({
    ...state,
    search: '',
  })),

  on(clearSelectedObservation, (state): ObservationsState => ({
    ...state,
    selectedObservation: null,
  })),

  on(clearObservationsError, (state): ObservationsState => ({
    ...state,
    error: null,
  })),
);

export function reducer(
  state: ObservationsState | undefined,
  action: Action,
): ObservationsState {
  return observationsReducer(state, action);
}
