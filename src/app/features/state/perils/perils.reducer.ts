import { Action, createReducer, on } from '@ngrx/store';
import { PerilResponse } from '../../dtos/perils/peril-response.dto';
import {
  archivePeril,
  archivePerilFailure,
  archivePerilSuccess,
  clearSelectedPeril,
  clearPerilFilters,
  clearPerilsError,
  createPeril,
  createPerilFailure,
  createPerilSuccess,
  loadPeril,
  loadPerilFailure,
  loadPerilSuccess,
  loadPerils,
  loadPerilsFailure,
  loadPerilsSuccess,
  setPerilsSearch,
  updatePeril,
  updatePerilFailure,
  updatePerilStatus,
  updatePerilStatusFailure,
  updatePerilStatusSuccess,
  updatePerilSuccess,
} from './perils.actions';
import { initialPerilsState, PerilsState } from './perils.state';

function upsert(perils: PerilResponse[], peril: PerilResponse): PerilResponse[] {
  return perils.some(item => item.id === peril.id)
    ? perils.map(item => item.id === peril.id ? peril : item)
    : [peril, ...perils];
}

export const perilsReducer = createReducer(
  initialPerilsState,

  on(loadPerils, (state): PerilsState => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(loadPerilsSuccess, (state, { perils }): PerilsState => ({
    ...state,
    perils,
    isLoading: false,
  })),

  on(loadPerilsFailure, (state, { error }): PerilsState => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(loadPeril, (state): PerilsState => ({
    ...state,
    selectedPeril: null,
    isLoading: true,
    error: null,
  })),

  on(loadPerilSuccess, (state, { peril }): PerilsState => ({
    ...state,
    selectedPeril: peril,
    perils: state.perils.length ? upsert(state.perils, peril) : state.perils,
    isLoading: false,
  })),

  on(loadPerilFailure, (state, { error }): PerilsState => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(
    createPeril,
    (state): PerilsState => ({
      ...state,
      isSaving: true,
      updatingPerilId: null,
      error: null,
    }),
  ),

  on(
    updatePeril,
    updatePerilStatus,
    (state, { perilId }): PerilsState => ({
      ...state,
      isSaving: true,
      updatingPerilId: perilId,
      error: null,
    }),
  ),

  on(
    archivePeril,
    (state, { perilId }): PerilsState => ({
      ...state,
      isSaving: true,
      updatingPerilId: perilId,
      error: null,
    }),
  ),

  on(createPerilSuccess, (state, { peril }): PerilsState => ({
    ...state,
    perils: upsert(state.perils, peril),
    selectedPeril: peril,
    isSaving: false,
    updatingPerilId: null,
  })),

  on(
    updatePerilSuccess,
    updatePerilStatusSuccess,
    (state, { peril }): PerilsState => ({
      ...state,
      perils: upsert(state.perils, peril),
      selectedPeril:
        state.selectedPeril?.id === peril.id ? peril : state.selectedPeril,
      isSaving: false,
      updatingPerilId: null,
    }),
  ),

  on(archivePerilSuccess, (state, { perilId }): PerilsState => ({
    ...state,
    perils: state.perils.filter(peril => peril.id !== perilId),
    selectedPeril:
      state.selectedPeril?.id === perilId ? null : state.selectedPeril,
    isSaving: false,
    updatingPerilId: null,
  })),

  on(
    createPerilFailure,
    updatePerilFailure,
    updatePerilStatusFailure,
    archivePerilFailure,
    (state, { error }): PerilsState => ({
      ...state,
      isSaving: false,
      updatingPerilId: null,
      error,
    }),
  ),

  on(setPerilsSearch, (state, { search }): PerilsState => ({
    ...state,
    search,
  })),

  on(clearPerilFilters, (state): PerilsState => ({
    ...state,
    search: '',
  })),

  on(clearSelectedPeril, (state): PerilsState => ({
    ...state,
    selectedPeril: null,
  })),

  on(clearPerilsError, (state): PerilsState => ({
    ...state,
    error: null,
  })),
);

export function reducer(
  state: PerilsState | undefined,
  action: Action,
): PerilsState {
  return perilsReducer(state, action);
}
