import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap } from 'rxjs/operators';
import { TriggerEventService } from '../../services/trigger-event.service';
import { httpErrorMessage } from '../products/products.effects';
import {
  loadTriggerEvent,
  loadTriggerEventFailure,
  loadTriggerEventSuccess,
  loadTriggerEvents,
  loadTriggerEventsFailure,
  loadTriggerEventsSuccess,
  rejectTriggerEvent,
  rejectTriggerEventFailure,
  rejectTriggerEventSuccess,
  startValidation,
  startValidationFailure,
  startValidationSuccess,
  verifyTriggerEvent,
  verifyTriggerEventFailure,
  verifyTriggerEventSuccess,
} from './trigger-events.actions';

@Injectable()
export class TriggerEventsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly eventService: TriggerEventService,
  ) {}

  loadTriggerEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTriggerEvents),
      switchMap(() =>
        this.eventService.getAllEvents().pipe(
          map(events => loadTriggerEventsSuccess({ events })),
          catchError(error =>
            of(loadTriggerEventsFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  loadTriggerEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTriggerEvent),
      switchMap(({ eventId }) =>
        this.eventService.getEvent(eventId).pipe(
          map(event => loadTriggerEventSuccess({ event })),
          catchError(error =>
            of(loadTriggerEventFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  startValidation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(startValidation),
      exhaustMap(({ eventId }) =>
        this.eventService.startValidation(eventId).pipe(
          map(event => startValidationSuccess({ event })),
          catchError(error =>
            of(startValidationFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  verifyTriggerEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(verifyTriggerEvent),
      exhaustMap(({ eventId, reviewNotes }) =>
        this.eventService.verifyEvent(eventId, reviewNotes).pipe(
          map(event => verifyTriggerEventSuccess({ event })),
          catchError(error =>
            of(verifyTriggerEventFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  rejectTriggerEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(rejectTriggerEvent),
      exhaustMap(({ eventId, reviewNotes }) =>
        this.eventService.rejectEvent(eventId, reviewNotes).pipe(
          map(event => rejectTriggerEventSuccess({ event })),
          catchError(error =>
            of(rejectTriggerEventFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );
}
