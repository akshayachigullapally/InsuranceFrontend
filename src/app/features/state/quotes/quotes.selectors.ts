import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QuotesState } from './quotes.state';

const selectQuotesState = createFeatureSelector<QuotesState>('quotes');

export const selectQuotes = createSelector(selectQuotesState, (state) => state.quotes);

export const selectQuotesLoading = createSelector(selectQuotesState, (state) => state.isLoading);

export const selectQuotesSaving = createSelector(selectQuotesState, (state) => state.isSaving);

export const selectQuotesError = createSelector(selectQuotesState, (state) => state.error);
