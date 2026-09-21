import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap } from 'rxjs/operators';
import { PerilService } from '../../services/peril.service';
import { httpErrorMessage } from '../products/products.effects';
import {
  archivePeril,
  archivePerilFailure,
  archivePerilSuccess,
  createPeril,
  createPerilFailure,
  createPerilSuccess,
  loadPeril,
  loadPerilFailure,
  loadPerilSuccess,
  loadPerils,
  loadPerilsFailure,
  loadPerilsSuccess,
  updatePeril,
  updatePerilFailure,
  updatePerilStatus,
  updatePerilStatusFailure,
  updatePerilStatusSuccess,
  updatePerilSuccess,
} from './perils.actions';

@Injectable()
export class PerilsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly perilService: PerilService,
  ) {}

  loadPerils$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPerils),
      switchMap(() =>
        this.perilService.getAllPerils().pipe(
          map(perils => loadPerilsSuccess({ perils })),
          catchError(error =>
            of(loadPerilsFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  loadPeril$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPeril),
      switchMap(({ perilId }) =>
        this.perilService.getPeril(perilId).pipe(
          map(peril => loadPerilSuccess({ peril })),
          catchError(error =>
            of(loadPerilFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  createPeril$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createPeril),
      exhaustMap(({ request }) =>
        this.perilService.createPeril(request).pipe(
          map(peril => createPerilSuccess({ peril })),
          catchError(error =>
            of(createPerilFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  updatePeril$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updatePeril),
      exhaustMap(({ perilId, request }) =>
        this.perilService.updatePeril(perilId, request).pipe(
          map(peril => updatePerilSuccess({ peril })),
          catchError(error =>
            of(updatePerilFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  updatePerilStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updatePerilStatus),
      exhaustMap(({ perilId, status }) =>
        this.perilService.updatePerilStatus(perilId, status).pipe(
          map(peril => updatePerilStatusSuccess({ peril })),
          catchError(error =>
            of(updatePerilStatusFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  archivePeril$ = createEffect(() =>
    this.actions$.pipe(
      ofType(archivePeril),
      exhaustMap(({ perilId }) =>
        this.perilService.archivePeril(perilId).pipe(
          map(() => archivePerilSuccess({ perilId })),
          catchError(error =>
            of(archivePerilFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );
}
