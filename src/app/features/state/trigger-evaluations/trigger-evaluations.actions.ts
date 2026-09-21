import { createAction, props } from '@ngrx/store';
import {
  TriggerEvaluationResponse,
} from '../../dtos/trigger-evaluations/trigger-evaluation-response.dto';

export const loadTriggerEvaluations = createAction(
  '[Trigger Evaluations] Load Trigger Evaluations',
);

export const loadTriggerEvaluationsSuccess = createAction(
  '[Trigger Evaluations] Load Trigger Evaluations Success',
  props<{ evaluations: TriggerEvaluationResponse[] }>(),
);

export const loadTriggerEvaluationsFailure = createAction(
  '[Trigger Evaluations] Load Trigger Evaluations Failure',
  props<{ error: string }>(),
);

export const loadTriggerEvaluation = createAction(
  '[Trigger Evaluations] Load Trigger Evaluation',
  props<{ evaluationId: number }>(),
);

export const loadTriggerEvaluationSuccess = createAction(
  '[Trigger Evaluations] Load Trigger Evaluation Success',
  props<{ evaluation: TriggerEvaluationResponse }>(),
);

export const loadTriggerEvaluationFailure = createAction(
  '[Trigger Evaluations] Load Trigger Evaluation Failure',
  props<{ error: string }>(),
);

export const setTriggerEvaluationsSearch = createAction(
  '[Trigger Evaluations] Set Search',
  props<{ search: string }>(),
);

export const clearTriggerEvaluationFilters = createAction(
  '[Trigger Evaluations] Clear Filters',
);

export const clearSelectedTriggerEvaluation = createAction(
  '[Trigger Evaluations] Clear Selected Evaluation',
);

export const clearTriggerEvaluationsError = createAction(
  '[Trigger Evaluations] Clear Error',
);
