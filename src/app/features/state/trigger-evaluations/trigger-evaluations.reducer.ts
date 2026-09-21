import { Action, createReducer, on } from '@ngrx/store';
import { TriggerEvaluationResponse } from '../../dtos/trigger-evaluations/trigger-evaluation-response.dto';
import {
  clearSelectedTriggerEvaluation,
  clearTriggerEvaluationFilters,
  clearTriggerEvaluationsError,
  loadTriggerEvaluations,
  loadTriggerEvaluationsFailure,
  loadTriggerEvaluationsSuccess,
  loadTriggerEvaluation,
  loadTriggerEvaluationFailure,
  loadTriggerEvaluationSuccess,
  setTriggerEvaluationsSearch,
} from './trigger-evaluations.actions';
import { initialTriggerEvaluationsState, TriggerEvaluationsState } from './trigger-evaluations.state';

function upsert(
  evaluations: TriggerEvaluationResponse[],
  evaluation: TriggerEvaluationResponse,
): TriggerEvaluationResponse[] {
  return evaluations.some(item => item.id === evaluation.id)
    ? evaluations.map(item => item.id === evaluation.id ? evaluation : item)
    : [evaluation, ...evaluations];
}

export const triggerEvaluationsReducer = createReducer(
  initialTriggerEvaluationsState,

  on(loadTriggerEvaluations, (state): TriggerEvaluationsState => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(loadTriggerEvaluationsSuccess, (state, { evaluations }): TriggerEvaluationsState => ({
    ...state,
    evaluations,
    isLoading: false,
  })),

  on(loadTriggerEvaluationsFailure, (state, { error }): TriggerEvaluationsState => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(loadTriggerEvaluation, (state): TriggerEvaluationsState => ({
    ...state,
    selectedEvaluation: null,
    isLoading: true,
    error: null,
  })),

  on(loadTriggerEvaluationSuccess, (state, { evaluation }): TriggerEvaluationsState => ({
    ...state,
    selectedEvaluation: evaluation,
    evaluations: state.evaluations.length
      ? upsert(state.evaluations, evaluation)
      : state.evaluations,
    isLoading: false,
  })),

  on(loadTriggerEvaluationFailure, (state, { error }): TriggerEvaluationsState => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(setTriggerEvaluationsSearch, (state, { search }): TriggerEvaluationsState => ({
    ...state,
    search,
  })),

  on(clearTriggerEvaluationFilters, (state): TriggerEvaluationsState => ({
    ...state,
    search: '',
  })),

  on(clearSelectedTriggerEvaluation, (state): TriggerEvaluationsState => ({
    ...state,
    selectedEvaluation: null,
  })),

  on(clearTriggerEvaluationsError, (state): TriggerEvaluationsState => ({
    ...state,
    error: null,
  })),
);

export function reducer(
  state: TriggerEvaluationsState | undefined,
  action: Action,
): TriggerEvaluationsState {
  return triggerEvaluationsReducer(state, action);
}
