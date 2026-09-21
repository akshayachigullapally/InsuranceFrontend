import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap } from 'rxjs/operators';
import { ObservationService } from '../../services/observation.service';
import { httpErrorMessage } from '../products/products.effects';
import {
  createObservation,
  createObservationFailure,
  createObservationSuccess,
  loadObservation,
  loadObservationFailure,
  loadObservationSuccess,
  loadObservations,
  loadObservationsFailure,
  loadObservationsSuccess,
} from './observations.actions';

@Injectable()
export class ObservationsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly observationService: ObservationService,
  ) {}

  loadObservations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadObservations),
      switchMap(() =>
        this.observationService.getAllObservations().pipe(
          map(observations => loadObservationsSuccess({ observations })),
          catchError(error =>
            of(loadObservationsFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  loadObservation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadObservation),
      switchMap(({ observationId }) =>
        this.observationService.getObservation(observationId).pipe(
          map(observation => loadObservationSuccess({ observation })),
          catchError(error =>
            of(loadObservationFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  createObservation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createObservation),
      exhaustMap(({ request }) =>
        this.observationService.createObservation(request).pipe(
          map(observation => createObservationSuccess({ observation })),
          catchError(error =>
            of(createObservationFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );
}
