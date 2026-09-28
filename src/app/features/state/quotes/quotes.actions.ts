import { createAction, props } from '@ngrx/store';
import { CreateQuoteRequest, QuoteResponse } from '../../dtos/financial/quote-response.dto';

export const loadQuotes = createAction('[Quotes] Load Quotes');

export const loadQuotesSuccess = createAction(
  '[Quotes] Load Quotes Success',
  props<{ quotes: QuoteResponse[] }>(),
);

export const loadQuotesFailure = createAction(
  '[Quotes] Load Quotes Failure',
  props<{ error: string }>(),
);

export const loadQuote = createAction('[Quotes] Load Quote', props<{ quoteId: number }>());

export const loadQuoteSuccess = createAction(
  '[Quotes] Load Quote Success',
  props<{ quote: QuoteResponse }>(),
);

export const loadQuoteFailure = createAction(
  '[Quotes] Load Quote Failure',
  props<{ error: string }>(),
);

export const createQuote = createAction(
  '[Quotes] Create Quote',
  props<{ request: CreateQuoteRequest }>(),
);

export const createQuoteSuccess = createAction(
  '[Quotes] Create Quote Success',
  props<{ quote: QuoteResponse }>(),
);

export const createQuoteFailure = createAction(
  '[Quotes] Create Quote Failure',
  props<{ error: string }>(),
);

export const acceptQuote = createAction('[Quotes] Accept Quote', props<{ quoteId: number }>());

export const acceptQuoteSuccess = createAction(
  '[Quotes] Accept Quote Success',
  props<{ quote: QuoteResponse }>(),
);

export const acceptQuoteFailure = createAction(
  '[Quotes] Accept Quote Failure',
  props<{ error: string }>(),
);

export const cancelQuote = createAction('[Quotes] Cancel Quote', props<{ quoteId: number }>());

export const cancelQuoteSuccess = createAction(
  '[Quotes] Cancel Quote Success',
  props<{ quoteId: number }>(),
);

export const cancelQuoteFailure = createAction(
  '[Quotes] Cancel Quote Failure',
  props<{ error: string }>(),
);

export const setQuotesSearch = createAction('[Quotes] Set Search', props<{ search: string }>());

export const clearQuotesFilters = createAction('[Quotes] Clear Filters');
export const clearSelectedQuote = createAction('[Quotes] Clear Selected Quote');
export const clearQuotesError = createAction('[Quotes] Clear Error');
