import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap } from 'rxjs/operators';
import { TriggerDefinitionService } from '../../services/trigger-definition.service';
import { httpErrorMessage } from '../products/products.effects';
import {
  archiveTriggerDefinition,
  archiveTriggerDefinitionFailure,
  archiveTriggerDefinitionSuccess,
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
  updateTriggerDefinition,
  updateTriggerDefinitionFailure,
  updateTriggerDefinitionStatus,
  updateTriggerDefinitionStatusFailure,
  updateTriggerDefinitionStatusSuccess,
  updateTriggerDefinitionSuccess,
} from './trigger-definitions.actions';

@Injectable()
export class TriggerDefinitionsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly definitionService: TriggerDefinitionService,
  ) {}

  loadTriggerDefinitions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTriggerDefinitions),
      switchMap(() =>
        this.definitionService.getAllDefinitions().pipe(
          map(definitions => loadTriggerDefinitionsSuccess({ definitions })),
          catchError(error =>
            of(loadTriggerDefinitionsFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  loadTriggerDefinition$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTriggerDefinition),
      switchMap(({ definitionId }) =>
        this.definitionService.getDefinition(definitionId).pipe(
          map(definition => loadTriggerDefinitionSuccess({ definition })),
          catchError(error =>
            of(loadTriggerDefinitionFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  createTriggerDefinition$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createTriggerDefinition),
      exhaustMap(({ request }) =>
        this.definitionService.createDefinition(request).pipe(
          map(definition => createTriggerDefinitionSuccess({ definition })),
          catchError(error =>
            of(createTriggerDefinitionFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  updateTriggerDefinition$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateTriggerDefinition),
      exhaustMap(({ definitionId, request }) =>
        this.definitionService.updateDefinition(definitionId, request).pipe(
          map(definition => updateTriggerDefinitionSuccess({ definition })),
          catchError(error =>
            of(updateTriggerDefinitionFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  updateTriggerDefinitionStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateTriggerDefinitionStatus),
      exhaustMap(({ definitionId, status }) =>
        this.definitionService.updateDefinitionStatus(definitionId, status).pipe(
          map(definition => updateTriggerDefinitionStatusSuccess({ definition })),
          catchError(error =>
            of(updateTriggerDefinitionStatusFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  archiveTriggerDefinition$ = createEffect(() =>
    this.actions$.pipe(
      ofType(archiveTriggerDefinition),
      exhaustMap(({ definitionId }) =>
        this.definitionService.archiveDefinition(definitionId).pipe(
          map(() => archiveTriggerDefinitionSuccess({ definitionId })),
          catchError(error =>
            of(archiveTriggerDefinitionFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  evaluateTriggerDefinition$ = createEffect(() =>
    this.actions$.pipe(
      ofType(evaluateTriggerDefinition),
      exhaustMap(({ definitionId, evaluationEnd }) =>
        this.definitionService.evaluateDefinition(definitionId, evaluationEnd).pipe(
          map(() => evaluateTriggerDefinitionSuccess()),
          catchError(error =>
            of(evaluateTriggerDefinitionFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );
}
