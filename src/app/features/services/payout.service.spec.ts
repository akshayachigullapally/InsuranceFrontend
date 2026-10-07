import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PayoutService } from './payout.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';

describe('PayoutService', () => {
  let service: PayoutService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PayoutService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates a payout', () => {
    const request = { claimId: 2, amount: 15000 } as never;

    service.createPayout(request).subscribe();

    const req = httpMock.expectOne(API_ENDPOINTS.financial.payouts);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ id: 1 });
  });
});
