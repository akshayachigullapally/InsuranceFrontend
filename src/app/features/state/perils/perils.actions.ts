import { createAction, props } from '@ngrx/store';
import {
  PerilManageableStatus,
  PerilRequest,
  PerilResponse,
} from '../../dtos/perils/peril-response.dto';

export const loadPerils = createAction('[Perils] Load Perils');

export const loadPerilsSuccess = createAction(
  '[Perils] Load Perils Success',
  props<{ perils: PerilResponse[] }>(),
);

export const loadPerilsFailure = createAction(
  '[Perils] Load Perils Failure',
  props<{ error: string }>(),
);

export const loadPeril = createAction(
  '[Perils] Load Peril',
  props<{ perilId: number }>(),
);

export const loadPerilSuccess = createAction(
  '[Perils] Load Peril Success',
  props<{ peril: PerilResponse }>(),
);

export const loadPerilFailure = createAction(
  '[Perils] Load Peril Failure',
  props<{ error: string }>(),
);

export const createPeril = createAction(
  '[Perils] Create Peril',
  props<{ request: PerilRequest }>(),
);

export const createPerilSuccess = createAction(
  '[Perils] Create Peril Success',
  props<{ peril: PerilResponse }>(),
);

export const createPerilFailure = createAction(
  '[Perils] Create Peril Failure',
  props<{ error: string }>(),
);

export const updatePeril = createAction(
  '[Perils] Update Peril',
  props<{ perilId: number; request: PerilRequest }>(),
);

export const updatePerilSuccess = createAction(
  '[Perils] Update Peril Success',
  props<{ peril: PerilResponse }>(),
);

export const updatePerilFailure = createAction(
  '[Perils] Update Peril Failure',
  props<{ error: string }>(),
);

export const updatePerilStatus = createAction(
  '[Perils] Update Peril Status',
  props<{ perilId: number; status: PerilManageableStatus }>(),
);

export const updatePerilStatusSuccess = createAction(
  '[Perils] Update Peril Status Success',
  props<{ peril: PerilResponse }>(),
);

export const updatePerilStatusFailure = createAction(
  '[Perils] Update Peril Status Failure',
  props<{ error: string }>(),
);

export const archivePeril = createAction(
  '[Perils] Archive Peril',
  props<{ perilId: number }>(),
);

export const archivePerilSuccess = createAction(
  '[Perils] Archive Peril Success',
  props<{ perilId: number }>(),
);

export const archivePerilFailure = createAction(
  '[Perils] Archive Peril Failure',
  props<{ error: string }>(),
);

export const setPerilsSearch = createAction(
  '[Perils] Set Search',
  props<{ search: string }>(),
);

export const clearPerilFilters = createAction('[Perils] Clear Filters');
export const clearSelectedPeril = createAction('[Perils] Clear Selected Peril');
export const clearPerilsError = createAction('[Perils] Clear Error');
