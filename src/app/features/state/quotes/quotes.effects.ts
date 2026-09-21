import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap } from 'rxjs/operators';
import { QuoteService } from '../../services/quote.service';
import { httpErrorMessage } from '../products/products.effects';
import {
  acceptQuote,
  acceptQuoteFailure,
  acceptQuoteSuccess,
  cancelQuote,
  cancelQuoteFailure,
  cancelQuoteSuccess,
  createQuote,
  createQuoteFailure,
  createQuoteSuccess,
  loadQuote,
  loadQuoteFailure,
  loadQuotes,
  loadQuotesFailure,
  loadQuotesSuccess,
  loadQuoteSuccess,
} from './quotes.actions';

@Injectable()
export class QuotesEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly quoteService: QuoteService,
  ) {}

  loadQuotes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadQuotes),
      switchMap(() =>
        this.quoteService.getMyQuotes().pipe(
          map(quotes => loadQuotesSuccess({ quotes })),
          catchError(error =>
            of(loadQuotesFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  loadQuote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadQuote),
      switchMap(({ quoteId }) =>
        this.quoteService.getQuote(quoteId).pipe(
          map(quote => loadQuoteSuccess({ quote })),
          catchError(error =>
            of(loadQuoteFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  createQuote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createQuote),
      exhaustMap(({ request }) =>
        this.quoteService.createQuote(request).pipe(
          map(quote => createQuoteSuccess({ quote })),
          catchError(error =>
            of(createQuoteFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  acceptQuote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(acceptQuote),
      exhaustMap(({ quoteId }) =>
        this.quoteService.acceptQuote(quoteId).pipe(
          map(quote => acceptQuoteSuccess({ quote })),
          catchError(error =>
            of(acceptQuoteFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  cancelQuote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(cancelQuote),
      exhaustMap(({ quoteId }) =>
        this.quoteService.cancelQuote(quoteId).pipe(
          map(() => cancelQuoteSuccess({ quoteId })),
          catchError(error =>
            of(cancelQuoteFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );
}
