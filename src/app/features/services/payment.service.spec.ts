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

  it('fetches my payments, one payment and all payments', () => {
    service.getMyPayments().subscribe();
    httpMock.expectOne(API_ENDPOINTS.financial.myPayments).flush([]);

    service.getPayment(5).subscribe();
    httpMock.expectOne(API_ENDPOINTS.financial.paymentById(5)).flush({ id: 5 });

    service.getAllPayments().subscribe();
    httpMock.expectOne(API_ENDPOINTS.financial.adminPayments).flush([]);
  });

  it('refunds a payment', () => {
    service.refundPayment(5).subscribe((response) => {
      expect(response.message).toBe('Refunded');
    });

    const req = httpMock.expectOne(API_ENDPOINTS.financial.paymentRefund(5));
    expect(req.request.method).toBe('PUT');
    req.flush({ message: 'Refunded' });
  });
});
