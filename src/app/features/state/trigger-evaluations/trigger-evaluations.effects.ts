import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TriggerEvaluationService } from '../../services/trigger-evaluation.service';
import { httpErrorMessage } from '../products/products.effects';
import {
  loadTriggerEvaluations,
  loadTriggerEvaluationsFailure,
  loadTriggerEvaluationsSuccess,
  loadTriggerEvaluation,
  loadTriggerEvaluationFailure,
  loadTriggerEvaluationSuccess,
} from './trigger-evaluations.actions';

@Injectable()
export class TriggerEvaluationsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly evaluationService: TriggerEvaluationService,
  ) {}

  loadTriggerEvaluations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTriggerEvaluations),
      switchMap(() =>
        this.evaluationService.getAllEvaluations().pipe(
          map(evaluations => loadTriggerEvaluationsSuccess({ evaluations })),
          catchError(error =>
            of(loadTriggerEvaluationsFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  loadTriggerEvaluation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTriggerEvaluation),
      switchMap(({ evaluationId }) =>
        this.evaluationService.getEvaluation(evaluationId).pipe(
          map(evaluation => loadTriggerEvaluationSuccess({ evaluation })),
          catchError(error =>
            of(loadTriggerEvaluationFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );
}
