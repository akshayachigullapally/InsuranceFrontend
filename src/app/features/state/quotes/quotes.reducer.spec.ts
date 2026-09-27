import { quotesReducer } from './quotes.reducer';
import { initialQuotesState, QuotesState } from './quotes.state';
import * as QuotesActions from './quotes.actions';
import { QuoteResponse } from '../../dtos/financial/quote-response.dto';

function makeQuote(id: number, status: QuoteResponse['status'] = 'CREATED'): QuoteResponse {
  return { id, quoteReference: `QTE-${id}`, status } as QuoteResponse;
}

describe('quotesReducer', () => {
  it('returns the initial state for an unknown action', () => {
    expect(quotesReducer(undefined, { type: '[Unknown]' } as never)).toEqual(initialQuotesState);
  });

  it('loads quotes', () => {
    const quotes = [makeQuote(1)];

    const state = quotesReducer(
      { ...initialQuotesState, isLoading: true },
      QuotesActions.loadQuotesSuccess({ quotes }),
    );

    expect(state.quotes).toEqual(quotes);
    expect(state.isLoading).toBe(false);
  });

  it('adds a created quote to the top', () => {
    const current: QuotesState = { ...initialQuotesState, quotes: [makeQuote(1)] };

    const state = quotesReducer(current, QuotesActions.createQuoteSuccess({ quote: makeQuote(2) }));

    expect(state.quotes.map((quote) => quote.id)).toEqual([2, 1]);
    expect(state.selectedQuote?.id).toBe(2);
  });

  it('replaces an accepted quote', () => {
    const current: QuotesState = { ...initialQuotesState, quotes: [makeQuote(1)] };

    const state = quotesReducer(current, QuotesActions.acceptQuoteSuccess({ quote: makeQuote(1, 'ACCEPTED') }));

    expect(state.quotes[0].status).toBe('ACCEPTED');
    expect(state.isSaving).toBe(false);
  });

  it('marks a cancelled quote and the selected quote as CANCELLED', () => {
    const current: QuotesState = { ...initialQuotesState, quotes: [makeQuote(1), makeQuote(2)], selectedQuote: makeQuote(1) };

    const state = quotesReducer(current, QuotesActions.cancelQuoteSuccess({ quoteId: 1 }));

    expect(state.quotes.map((quote) => quote.status)).toEqual(['CANCELLED', 'CREATED']);
    expect(state.selectedQuote?.status).toBe('CANCELLED');
  });

  it('sets isSaving while saving and stores failures', () => {
    const saving = quotesReducer(initialQuotesState, QuotesActions.acceptQuote({ quoteId: 1 }));
    expect(saving.isSaving).toBe(true);

    const failed = quotesReducer(saving, QuotesActions.acceptQuoteFailure({ error: 'Expired' }));
    expect(failed.isSaving).toBe(false);
    expect(failed.error).toBe('Expired');
  });
});
