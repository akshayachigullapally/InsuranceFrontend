import { createAction, props } from '@ngrx/store';
import {
  CreateObservationRequest,
  ObservationResponse,
} from '../../dtos/observations/observation-response.dto';

export const loadObservations = createAction('[Observations] Load Observations');

export const loadObservationsSuccess = createAction(
  '[Observations] Load Observations Success',
  props<{ observations: ObservationResponse[] }>(),
);

export const loadObservationsFailure = createAction(
  '[Observations] Load Observations Failure',
  props<{ error: string }>(),
);

export const loadObservation = createAction(
  '[Observations] Load Observation',
  props<{ observationId: number }>(),
);

export const loadObservationSuccess = createAction(
  '[Observations] Load Observation Success',
  props<{ observation: ObservationResponse }>(),
);

export const loadObservationFailure = createAction(
  '[Observations] Load Observation Failure',
  props<{ error: string }>(),
);

export const createObservation = createAction(
  '[Observations] Create Observation',
  props<{ request: CreateObservationRequest }>(),
);

export const createObservationSuccess = createAction(
  '[Observations] Create Observation Success',
  props<{ observation: ObservationResponse }>(),
);

export const createObservationFailure = createAction(
  '[Observations] Create Observation Failure',
  props<{ error: string }>(),
);

export const setObservationsSearch = createAction(
  '[Observations] Set Search',
  props<{ search: string }>(),
);

export const clearObservationFilters = createAction('[Observations] Clear Filters');
export const clearSelectedObservation = createAction('[Observations] Clear Selected Observation');
export const clearObservationsError = createAction('[Observations] Clear Error');
