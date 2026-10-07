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
});
