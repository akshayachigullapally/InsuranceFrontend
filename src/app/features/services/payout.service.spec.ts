import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PayoutService } from './payout.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';

describe('PayoutService', () => {
  let service: PayoutService;
  let httpMock: HttpTestingController;
  const action = { remarks: 'Bank transfer' } as never;

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

  it('fetches my payouts, one payout and all payouts', () => {
    service.getMyPayouts().subscribe((payouts) => {
      expect(payouts.length).toBe(1);
    });
    httpMock.expectOne(API_ENDPOINTS.financial.myPayouts).flush([{ id: 1 }]);

    service.getPayout(1).subscribe();
    httpMock.expectOne(API_ENDPOINTS.financial.payoutById(1)).flush({ id: 1 });

    service.getAllPayouts().subscribe();
    httpMock.expectOne(API_ENDPOINTS.financial.adminPayouts).flush([]);
  });

  it.each([
    ['retryPayout', API_ENDPOINTS.financial.payoutRetry(1)],
  ] as const)('%s sends a PUT with the action body', (method, url) => {
    service[method](1, action).subscribe();

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(action);
    req.flush({ id: 1 });
  });
});
