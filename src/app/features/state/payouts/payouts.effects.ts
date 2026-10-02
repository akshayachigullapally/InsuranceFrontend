import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap } from 'rxjs/operators';
import { PayoutService } from '../../services/payout.service';
import { httpErrorMessage } from '../products/products.effects';
import {
  createPayout,
  createPayoutFailure,
  createPayoutSuccess,
  loadMyPayouts,
  loadMyPayoutsFailure,
  loadMyPayoutsSuccess,
  loadPayout,
  loadPayoutFailure,
  loadPayouts,
  loadPayoutsFailure,
  loadPayoutsSuccess,
  loadPayoutSuccess,
  retryPayout,
  retryPayoutFailure,
  retryPayoutSuccess,
} from './payouts.actions';

@Injectable()
export class PayoutsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly payoutService: PayoutService,
  ) {}

  loadPayouts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPayouts),
      switchMap(() =>
        this.payoutService.getAllPayouts().pipe(
          map(payouts => loadPayoutsSuccess({ payouts })),
          catchError(error =>
            of(loadPayoutsFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  loadMyPayouts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadMyPayouts),
      switchMap(() =>
        this.payoutService.getMyPayouts().pipe(
          map(payouts => loadMyPayoutsSuccess({ payouts })),
          catchError(error =>
            of(loadMyPayoutsFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  loadPayout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPayout),
      switchMap(({ payoutId }) =>
        this.payoutService.getPayout(payoutId).pipe(
          map(payout => loadPayoutSuccess({ payout })),
          catchError(error =>
            of(loadPayoutFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  createPayout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createPayout),
      exhaustMap(({ request }) =>
        this.payoutService.createPayout(request).pipe(
          map(payout => createPayoutSuccess({ payout })),
          catchError(error =>
            of(createPayoutFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  retryPayout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(retryPayout),
      exhaustMap(({ payoutId, request }) =>
        this.payoutService.retryPayout(payoutId, request).pipe(
          map(payout => retryPayoutSuccess({ payout })),
          catchError(error =>
            of(retryPayoutFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );
}
