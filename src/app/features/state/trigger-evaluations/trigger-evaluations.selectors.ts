import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TriggerEvaluationsState } from './trigger-evaluations.state';

const selectTriggerEvaluationsState = createFeatureSelector<TriggerEvaluationsState>('triggerEvaluations');

export const selectTriggerEvaluations = createSelector(
  selectTriggerEvaluationsState,
  state => state.evaluations,
);

export const selectSelectedTriggerEvaluation = createSelector(
  selectTriggerEvaluationsState,
  state => state.selectedEvaluation,
);

export const selectTriggerEvaluationsSearch = createSelector(
  selectTriggerEvaluationsState,
  state => state.search,
);

export const selectTriggerEvaluationsLoading = createSelector(
  selectTriggerEvaluationsState,
  state => state.isLoading,
);

export const selectTriggerEvaluationsError = createSelector(
  selectTriggerEvaluationsState,
  state => state.error,
);

export const selectFilteredTriggerEvaluations = createSelector(
  selectTriggerEvaluations,
  selectTriggerEvaluationsSearch,
  (evaluations, search) => {
    const value = search.trim().toLowerCase();

    if (!value) return evaluations;

    return evaluations.filter(evaluation =>
      evaluation.evaluationReference.toLowerCase().includes(value) ||
      evaluation.definitionCode?.toLowerCase().includes(value) === true ||
      evaluation.definitionName?.toLowerCase().includes(value) === true ||
      evaluation.zoneCode?.toLowerCase().includes(value) === true ||
      evaluation.zoneName?.toLowerCase().includes(value) === true ||
      evaluation.measurementType.toLowerCase().includes(value) ||
      evaluation.result.toLowerCase().includes(value),
    );
  },
);

export const selectMatchedEvaluationCount = createSelector(
  selectTriggerEvaluations,
  evaluations => evaluations.filter(e => e.result === 'MATCHED').length,
);

export const selectNotMatchedEvaluationCount = createSelector(
  selectTriggerEvaluations,
  evaluations => evaluations.filter(e => e.result === 'NOT_MATCHED').length,
);
