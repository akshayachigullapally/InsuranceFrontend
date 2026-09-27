import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { QuoteService } from './quote.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';

describe('QuoteService', () => {
  let service: QuoteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(QuoteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates a quote', () => {
    const request = { productId: 1, locationZoneId: 2, sumInsured: 50000 } as never;

    service.createQuote(request).subscribe((quote) => {
      expect(quote.id).toBe(3);
    });

    const req = httpMock.expectOne(API_ENDPOINTS.financial.quotes);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ id: 3 });
  });

  it('fetches my quotes and a single quote', () => {
    service.getMyQuotes().subscribe((quotes) => {
      expect(quotes.length).toBe(1);
    });
    httpMock.expectOne(API_ENDPOINTS.financial.myQuotes).flush([{ id: 3 }]);

    service.getQuote(3).subscribe();
    httpMock.expectOne(API_ENDPOINTS.financial.quoteById(3)).flush({ id: 3 });
  });

  it('accepts and cancels a quote with PUT requests', () => {
    service.acceptQuote(3).subscribe();
    const accept = httpMock.expectOne(API_ENDPOINTS.financial.acceptQuote(3));
    expect(accept.request.method).toBe('PUT');
    accept.flush({ id: 3, status: 'ACCEPTED' });

    service.cancelQuote(3).subscribe();
    const cancel = httpMock.expectOne(API_ENDPOINTS.financial.cancelQuote(3));
    expect(cancel.request.method).toBe('PUT');
    cancel.flush({ message: 'Cancelled' });
  });
});
