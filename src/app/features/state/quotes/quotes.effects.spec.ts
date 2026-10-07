import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { QuotesEffects } from './quotes.effects';
import * as QuotesActions from './quotes.actions';
import { QuoteService } from '../../services/quote.service';
import { QuoteResponse } from '../../dtos/financial/quote-response.dto';

function collect(effect$: Observable<unknown>): unknown[] {
  const results: unknown[] = [];
  effect$.subscribe((action) => results.push(action));
  return results;
}

describe('QuotesEffects', () => {
  let actions$: Observable<Action>;
  let effects: QuotesEffects;
  let quoteService: Record<string, ReturnType<typeof vi.fn>>;
  const quote = { id: 1, quoteReference: 'QTE-1', status: 'CREATED' } as QuoteResponse;

  beforeEach(() => {
    quoteService = { getMyQuotes: vi.fn(), createQuote: vi.fn(), acceptQuote: vi.fn(), cancelQuote: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        QuotesEffects,
        provideMockActions(() => actions$),
        { provide: QuoteService, useValue: quoteService },
      ],
    });
    effects = TestBed.inject(QuotesEffects);
  });

  it('loads my quotes', () => {
    quoteService['getMyQuotes'].mockReturnValue(of([quote]));
    actions$ = of(QuotesActions.loadQuotes());

    expect(collect(effects.loadQuotes$)).toEqual([QuotesActions.loadQuotesSuccess({ quotes: [quote] })]);
  });

  it('maps accept errors', () => {
    quoteService['acceptQuote'].mockReturnValue(throwError(() => ({ error: { message: 'Quote expired' } })));
    actions$ = of(QuotesActions.acceptQuote({ quoteId: 1 }));

    expect(collect(effects.acceptQuote$)).toEqual([QuotesActions.acceptQuoteFailure({ error: 'Quote expired' })]);
  });
});
