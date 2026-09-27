import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap } from 'rxjs/operators';
import { PaymentService } from '../../services/payment.service';
import { httpErrorMessage } from '../products/products.effects';
import {
  createPayment,
  createPaymentFailure,
  createPaymentSuccess,
  loadMyPayments,
  loadMyPaymentsFailure,
  loadMyPaymentsSuccess,
  loadPayment,
  loadPaymentFailure,
  loadPayments,
  loadPaymentsFailure,
  loadPaymentsSuccess,
  loadPaymentSuccess,
  markPaymentFail,
  markPaymentFailFailure,
  markPaymentFailSuccess,
  markPaymentSuccess,
  markPaymentSuccessFailure,
  markPaymentSuccessSuccess,
  refundPayment,
  refundPaymentFailure,
  refundPaymentSuccess,
} from './payments.actions';

@Injectable()
export class PaymentsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly paymentService: PaymentService,
  ) {}

  loadPayments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPayments),
      switchMap(() =>
        this.paymentService.getAllPayments().pipe(
          map(payments => loadPaymentsSuccess({ payments })),
          catchError(error =>
            of(loadPaymentsFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  loadMyPayments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadMyPayments),
      switchMap(() =>
        this.paymentService.getMyPayments().pipe(
          map(payments => loadMyPaymentsSuccess({ payments })),
          catchError(error =>
            of(loadMyPaymentsFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  loadPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPayment),
      switchMap(({ paymentId }) =>
        this.paymentService.getPayment(paymentId).pipe(
          map(payment => loadPaymentSuccess({ payment })),
          catchError(error =>
            of(loadPaymentFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  createPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createPayment),
      exhaustMap(({ request }) =>
        this.paymentService.createPayment(request).pipe(
          map(payment => createPaymentSuccess({ payment })),
          catchError(error =>
            of(createPaymentFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  reloadAfterPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createPaymentSuccess),
      map(() => loadMyPayments()),
    ),
  );

  markPaymentSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(markPaymentSuccess),
      exhaustMap(({ paymentId, request }) =>
        this.paymentService.markSuccess(paymentId, request).pipe(
          map(payment => markPaymentSuccessSuccess({ payment })),
          catchError(error =>
            of(markPaymentSuccessFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  markPaymentFail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(markPaymentFail),
      exhaustMap(({ paymentId, request }) =>
        this.paymentService.markFail(paymentId, request).pipe(
          map(payment => markPaymentFailSuccess({ payment })),
          catchError(error =>
            of(markPaymentFailFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  refundPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(refundPayment),
      exhaustMap(({ paymentId }) =>
        this.paymentService.refundPayment(paymentId).pipe(
          map(() => refundPaymentSuccess({ paymentId })),
          catchError(error =>
            of(refundPaymentFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );
}
