import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QuotesState } from './quotes.state';

const selectQuotesState = createFeatureSelector<QuotesState>('quotes');

export const selectQuotes = createSelector(selectQuotesState, (state) => state.quotes);

const selectQuotesSearch = createSelector(selectQuotesState, (state) => state.search);

export const selectQuotesLoading = createSelector(selectQuotesState, (state) => state.isLoading);

export const selectQuotesSaving = createSelector(selectQuotesState, (state) => state.isSaving);

export const selectQuotesError = createSelector(selectQuotesState, (state) => state.error);

export const selectFilteredQuotes = createSelector(
  selectQuotes,
  selectQuotesSearch,
  (quotes, search) => {
    const value = search.trim().toLowerCase();

    if (!value) return quotes;

    return quotes.filter(
      (quote) =>
        quote.quoteReference.toLowerCase().includes(value) ||
        quote.status.toLowerCase().includes(value),
    );
  },
);

export const selectCreatedQuoteCount = createSelector(
  selectQuotes,
  (quotes) => quotes.filter((quote) => quote.status === 'CREATED').length,
);

export const selectAcceptedQuoteCount = createSelector(
  selectQuotes,
  (quotes) => quotes.filter((quote) => quote.status === 'ACCEPTED').length,
);

export const selectExpiredQuoteCount = createSelector(
  selectQuotes,
  (quotes) => quotes.filter((quote) => quote.status === 'EXPIRED').length,
);
