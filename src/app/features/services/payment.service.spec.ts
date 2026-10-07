import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PaymentService } from './payment.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';

describe('PaymentService', () => {
  let service: PaymentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates a payment', () => {
    const request = { policyId: 1, amount: 1200 } as never;

    service.createPayment(request).subscribe((payment) => {
      expect(payment.id).toBe(5);
    });

    const req = httpMock.expectOne(API_ENDPOINTS.financial.payments);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ id: 5 });
  });
});
