import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PolicyService } from './policy.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';

describe('PolicyService', () => {
  let service: PolicyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PolicyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches my policies with an optional status filter', () => {
    service.getMyPolicies().subscribe();
    const all = httpMock.expectOne(API_ENDPOINTS.policies.myPolicies);
    expect(all.request.params.has('status')).toBe(false);
    all.flush([]);

    service.getMyPolicies('ACTIVE').subscribe();
    const filtered = httpMock.expectOne(
      (request) => request.url === API_ENDPOINTS.policies.myPolicies,
    );
    expect(filtered.request.params.get('status')).toBe('ACTIVE');
    filtered.flush([]);
  });

  it('creates a policy', () => {
    const request = { productId: 1, locationZoneId: 2, sumInsured: 100000 } as never;

    service.createPolicy(request).subscribe((policy) => {
      expect(policy.id).toBe(10);
    });

    const req = httpMock.expectOne(API_ENDPOINTS.policies.create);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ id: 10 });
  });

  it('fetches review data, history and snapshot', () => {
    service.getPendingPolicies().subscribe();
    httpMock.expectOne(API_ENDPOINTS.policies.reviewPending).flush([]);

    service.getReviewHistory().subscribe();
    httpMock.expectOne(API_ENDPOINTS.policies.reviewHistory).flush([]);

    service.getPolicyHistory(3).subscribe();
    httpMock.expectOne(API_ENDPOINTS.policies.history(3)).flush([]);

    service.getPolicySnapshot(3).subscribe();
    httpMock.expectOne(API_ENDPOINTS.policies.snapshot(3)).flush({});
  });
});
