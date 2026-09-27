import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PricingRuleService } from './pricing-rule.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { PricingRuleRequest } from '../dtos/financial/pricing-rule-response.dto';

describe('PricingRuleService', () => {
  let service: PricingRuleService;
  let httpMock: HttpTestingController;

  const request = {
    ruleName: 'Monsoon loading',
    effectiveFrom: ' 2026-06-01 ',
    effectiveTo: ' 2026-09-30 ',
  } as unknown as PricingRuleRequest;

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

  it('trims the effective dates when creating a rule', () => {
    service.createRule(request).subscribe();

    const req = httpMock.expectOne({ url: API_ENDPOINTS.financial.pricingRules, method: 'POST' });
    expect(req.request.body).toEqual({
      ruleName: 'Monsoon loading',
      effectiveFrom: '2026-06-01',
      effectiveTo: '2026-09-30',
    });
    req.flush({ id: 3 });
  });

  it('keeps missing dates untouched when updating a rule', () => {
    const withoutEnd = { ...request, effectiveTo: undefined } as unknown as PricingRuleRequest;

    service.updateRule(3, withoutEnd).subscribe();

    const req = httpMock.expectOne({
      url: API_ENDPOINTS.financial.pricingRuleById(3),
      method: 'PUT',
    });
    expect(req.request.body.effectiveFrom).toBe('2026-06-01');
    expect(req.request.body.effectiveTo).toBeUndefined();
    req.flush({ id: 3 });
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
