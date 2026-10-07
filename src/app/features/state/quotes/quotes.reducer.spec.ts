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

  it('marks a cancelled quote and the selected quote as CANCELLED', () => {
    const current: QuotesState = { ...initialQuotesState, quotes: [makeQuote(1), makeQuote(2)], selectedQuote: makeQuote(1) };

    const state = quotesReducer(current, QuotesActions.cancelQuoteSuccess({ quoteId: 1 }));

    expect(state.quotes.map((quote) => quote.status)).toEqual(['CANCELLED', 'CREATED']);
    expect(state.selectedQuote?.status).toBe('CANCELLED');
  });
});
