import { Action, createReducer, on } from '@ngrx/store';
import { QuoteResponse } from '../../dtos/financial/quote-response.dto';
import {
  acceptQuote,
  acceptQuoteFailure,
  acceptQuoteSuccess,
  cancelQuote,
  cancelQuoteFailure,
  cancelQuoteSuccess,
  clearQuotesError,
  clearQuotesFilters,
  clearSelectedQuote,
  createQuote,
  createQuoteFailure,
  createQuoteSuccess,
  loadQuote,
  loadQuoteFailure,
  loadQuotes,
  loadQuotesFailure,
  loadQuotesSuccess,
  loadQuoteSuccess,
  setQuotesSearch,
} from './quotes.actions';
import { initialQuotesState, QuotesState } from './quotes.state';

function upsert(quotes: QuoteResponse[], quote: QuoteResponse): QuoteResponse[] {
  return quotes.some((item) => item.id === quote.id)
    ? quotes.map((item) => (item.id === quote.id ? quote : item))
    : [quote, ...quotes];
}

export const quotesReducer = createReducer(
  initialQuotesState,

  on(loadQuotes, (state): QuotesState => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(loadQuotesSuccess, (state, { quotes }): QuotesState => ({
    ...state,
    quotes,
    isLoading: false,
  })),

  on(loadQuotesFailure, (state, { error }): QuotesState => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(loadQuote, (state): QuotesState => ({
    ...state,
    selectedQuote: null,
    isLoading: true,
    error: null,
  })),

  on(loadQuoteSuccess, (state, { quote }): QuotesState => ({
    ...state,
    selectedQuote: quote,
    quotes: state.quotes.length ? upsert(state.quotes, quote) : state.quotes,
    isLoading: false,
  })),

  on(loadQuoteFailure, (state, { error }): QuotesState => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(createQuote, (state): QuotesState => ({
    ...state,
    isSaving: true,
    error: null,
  })),

  on(acceptQuote, cancelQuote, (state): QuotesState => ({
    ...state,
    isSaving: true,
    error: null,
  })),

  on(createQuoteSuccess, (state, { quote }): QuotesState => ({
    ...state,
    quotes: upsert(state.quotes, quote),
    selectedQuote: quote,
    isSaving: false,
  })),

  on(acceptQuoteSuccess, (state, { quote }): QuotesState => ({
    ...state,
    quotes: upsert(state.quotes, quote),
    selectedQuote: state.selectedQuote?.id === quote.id ? quote : state.selectedQuote,
    isSaving: false,
  })),

  on(cancelQuoteSuccess, (state, { quoteId }): QuotesState => ({
    ...state,
    quotes: state.quotes.map((q) =>
      q.id === quoteId ? { ...q, status: 'CANCELLED' as const } : q,
    ),
    selectedQuote:
      state.selectedQuote?.id === quoteId
        ? { ...state.selectedQuote, status: 'CANCELLED' as const }
        : state.selectedQuote,
    isSaving: false,
  })),

  on(
    createQuoteFailure,
    acceptQuoteFailure,
    cancelQuoteFailure,
    (state, { error }): QuotesState => ({
      ...state,
      isSaving: false,
      error,
    }),
  ),

  on(setQuotesSearch, (state, { search }): QuotesState => ({
    ...state,
    search,
  })),

  on(clearQuotesFilters, (state): QuotesState => ({
    ...state,
    search: '',
  })),

  on(clearSelectedQuote, (state): QuotesState => ({
    ...state,
    selectedQuote: null,
  })),

  on(clearQuotesError, (state): QuotesState => ({
    ...state,
    error: null,
  })),
);

export function reducer(state: QuotesState | undefined, action: Action): QuotesState {
  return quotesReducer(state, action);
}
