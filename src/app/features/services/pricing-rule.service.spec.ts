import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PricingRuleService } from './pricing-rule.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';

describe('PricingRuleService', () => {
  let service: PricingRuleService;
  let httpMock: HttpTestingController;


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PricingRuleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches all rules and a single rule', () => {
    service.getAllRules().subscribe();
    httpMock.expectOne({ url: API_ENDPOINTS.financial.pricingRules, method: 'GET' }).flush([]);

    service.getRule(3).subscribe();
    httpMock
      .expectOne({ url: API_ENDPOINTS.financial.pricingRuleById(3), method: 'GET' })
      .flush({ id: 3 });
  });

  it('updates the status and archives a rule', () => {
    service.updateStatus(3, 'INACTIVE' as never).subscribe();
    const status = httpMock.expectOne(API_ENDPOINTS.financial.pricingRuleStatus(3));
    expect(status.request.method).toBe('PUT');
    expect(status.request.body).toEqual({ status: 'INACTIVE' });
    status.flush({ id: 3 });

    service.archiveRule(3).subscribe();
    httpMock
      .expectOne({ url: API_ENDPOINTS.financial.pricingRuleById(3), method: 'DELETE' })
      .flush({ message: 'Archived' });
  });
});
