import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TriggerEventService } from '../../services/trigger-event.service';
import { httpErrorMessage } from '../products/products.effects';
import {
  loadTriggerEvent,
  loadTriggerEventFailure,
  loadTriggerEventSuccess,
  loadTriggerEvents,
  loadTriggerEventsFailure,
  loadTriggerEventsSuccess,
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
}
