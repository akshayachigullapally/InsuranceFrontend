import { Action, createReducer, on } from '@ngrx/store';
import { TriggerDefinitionResponse } from '../../dtos/trigger-definitions/trigger-definition-response.dto';
import {
  archiveTriggerDefinition,
  archiveTriggerDefinitionFailure,
  archiveTriggerDefinitionSuccess,
  clearSelectedTriggerDefinition,
  clearTriggerDefinitionFilters,
  clearTriggerDefinitionsError,
  createTriggerDefinition,
  createTriggerDefinitionFailure,
  createTriggerDefinitionSuccess,
  evaluateTriggerDefinition,
  evaluateTriggerDefinitionFailure,
  evaluateTriggerDefinitionSuccess,
  loadTriggerDefinition,
  loadTriggerDefinitionFailure,
  loadTriggerDefinitionSuccess,
  loadTriggerDefinitions,
  loadTriggerDefinitionsFailure,
  loadTriggerDefinitionsSuccess,
  setTriggerDefinitionsSearch,
  updateTriggerDefinition,
  updateTriggerDefinitionFailure,
  updateTriggerDefinitionStatus,
  updateTriggerDefinitionStatusFailure,
  updateTriggerDefinitionStatusSuccess,
  updateTriggerDefinitionSuccess,
} from './trigger-definitions.actions';
import { initialTriggerDefinitionsState, TriggerDefinitionsState } from './trigger-definitions.state';

function upsert(
  definitions: TriggerDefinitionResponse[],
  definition: TriggerDefinitionResponse,
): TriggerDefinitionResponse[] {
  return definitions.some(item => item.id === definition.id)
    ? definitions.map(item => item.id === definition.id ? definition : item)
    : [definition, ...definitions];
}

export const triggerDefinitionsReducer = createReducer(
  initialTriggerDefinitionsState,

  on(loadTriggerDefinitions, (state): TriggerDefinitionsState => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(loadTriggerDefinitionsSuccess, (state, { definitions }): TriggerDefinitionsState => ({
    ...state,
    definitions,
    isLoading: false,
  })),

  on(loadTriggerDefinitionsFailure, (state, { error }): TriggerDefinitionsState => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(loadTriggerDefinition, (state): TriggerDefinitionsState => ({
    ...state,
    selectedDefinition: null,
    isLoading: true,
    error: null,
  })),

  on(loadTriggerDefinitionSuccess, (state, { definition }): TriggerDefinitionsState => ({
    ...state,
    selectedDefinition: definition,
    definitions: state.definitions.length
      ? upsert(state.definitions, definition)
      : state.definitions,
    isLoading: false,
  })),

  on(loadTriggerDefinitionFailure, (state, { error }): TriggerDefinitionsState => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(
    createTriggerDefinition,
    (state): TriggerDefinitionsState => ({
      ...state,
      isSaving: true,
      updatingDefinitionId: null,
      error: null,
    }),
  ),

  on(
    updateTriggerDefinition,
    updateTriggerDefinitionStatus,
    (state, { definitionId }): TriggerDefinitionsState => ({
      ...state,
      isSaving: true,
      updatingDefinitionId: definitionId,
      error: null,
    }),
  ),

  on(
    archiveTriggerDefinition,
    (state, { definitionId }): TriggerDefinitionsState => ({
      ...state,
      isSaving: true,
      updatingDefinitionId: definitionId,
      error: null,
    }),
  ),

  on(createTriggerDefinitionSuccess, (state, { definition }): TriggerDefinitionsState => ({
    ...state,
    definitions: upsert(state.definitions, definition),
    selectedDefinition: definition,
    isSaving: false,
    updatingDefinitionId: null,
  })),

  on(
    updateTriggerDefinitionSuccess,
    updateTriggerDefinitionStatusSuccess,
    (state, { definition }): TriggerDefinitionsState => ({
      ...state,
      definitions: upsert(state.definitions, definition),
      selectedDefinition:
        state.selectedDefinition?.id === definition.id
          ? definition
          : state.selectedDefinition,
      isSaving: false,
      updatingDefinitionId: null,
    }),
  ),

  on(archiveTriggerDefinitionSuccess, (state, { definitionId }): TriggerDefinitionsState => ({
    ...state,
    definitions: state.definitions.filter(d => d.id !== definitionId),
    selectedDefinition:
      state.selectedDefinition?.id === definitionId
        ? null
        : state.selectedDefinition,
    isSaving: false,
    updatingDefinitionId: null,
  })),

  on(evaluateTriggerDefinition, (state): TriggerDefinitionsState => ({
    ...state,
    isEvaluating: true,
    error: null,
  })),

  on(evaluateTriggerDefinitionSuccess, (state): TriggerDefinitionsState => ({
    ...state,
    isEvaluating: false,
  })),

  on(evaluateTriggerDefinitionFailure, (state, { error }): TriggerDefinitionsState => ({
    ...state,
    isEvaluating: false,
    error,
  })),

  on(
    createTriggerDefinitionFailure,
    updateTriggerDefinitionFailure,
    updateTriggerDefinitionStatusFailure,
    archiveTriggerDefinitionFailure,
    (state, { error }): TriggerDefinitionsState => ({
      ...state,
      isSaving: false,
      updatingDefinitionId: null,
      error,
    }),
  ),

  on(setTriggerDefinitionsSearch, (state, { search }): TriggerDefinitionsState => ({
    ...state,
    search,
  })),

  on(clearTriggerDefinitionFilters, (state): TriggerDefinitionsState => ({
    ...state,
    search: '',
  })),

  on(clearSelectedTriggerDefinition, (state): TriggerDefinitionsState => ({
    ...state,
    selectedDefinition: null,
  })),

  on(clearTriggerDefinitionsError, (state): TriggerDefinitionsState => ({
    ...state,
    error: null,
  })),
);

export function reducer(
  state: TriggerDefinitionsState | undefined,
  action: Action,
): TriggerDefinitionsState {
  return triggerDefinitionsReducer(state, action);
}
