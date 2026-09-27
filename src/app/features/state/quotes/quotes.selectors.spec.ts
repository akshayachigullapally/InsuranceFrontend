import { QuoteResponse } from '../../dtos/financial/quote-response.dto';
import {
  selectAcceptedQuoteCount,
  selectCreatedQuoteCount,
  selectExpiredQuoteCount,
  selectFilteredQuotes,
} from './quotes.selectors';

function quote(id: number, status: QuoteResponse['status']): QuoteResponse {
  return { id, quoteReference: `QTE-00${id}`, status } as QuoteResponse;
}

describe('quotes selectors', () => {
  const quotes = [quote(1, 'CREATED'), quote(2, 'ACCEPTED'), quote(3, 'EXPIRED'), quote(4, 'CREATED')];

  it('searches by reference and status', () => {
    expect(selectFilteredQuotes.projector(quotes, '').length).toBe(4);
    expect(selectFilteredQuotes.projector(quotes, 'qte-002').map((q) => q.id)).toEqual([2]);
    expect(selectFilteredQuotes.projector(quotes, 'expired').map((q) => q.id)).toEqual([3]);
  });

  it('counts quotes by status', () => {
    expect(selectCreatedQuoteCount.projector(quotes)).toBe(2);
    expect(selectAcceptedQuoteCount.projector(quotes)).toBe(1);
    expect(selectExpiredQuoteCount.projector(quotes)).toBe(1);
  });
});
