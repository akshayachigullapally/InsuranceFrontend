import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ClaimService } from './claim.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';

describe('ClaimService', () => {
  let service: ClaimService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ClaimService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches my claims without a status filter', () => {
    service.getMyClaims().subscribe((claims) => {
      expect(claims).toEqual([]);
    });

    const req = httpMock.expectOne(API_ENDPOINTS.claims.myClaims);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('status')).toBe(false);
    req.flush([]);
  });

  it('adds the status param when filtering my claims', () => {
    service.getMyClaims('APPROVED').subscribe();

    const req = httpMock.expectOne(
      (request) => request.url === API_ENDPOINTS.claims.myClaims,
    );
    expect(req.request.params.get('status')).toBe('APPROVED');
    req.flush([]);
  });

  it('creates a claim', () => {
    const request = {
      policyId: 3,
      incidentType: 'EXCESS_RAINFALL',
      incidentDate: '2026-09-20',
      incidentLocation: 'Gachibowli',
      description: 'Crop damage',
      claimedAmount: 25000,
    };

    service.createClaim(request).subscribe((claim) => {
      expect(claim.id).toBe(11);
    });

    const req = httpMock.expectOne(API_ENDPOINTS.claims.create);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ id: 11 });
  });

  it('sends the approved amount when approving a claim', () => {
    service.approveClaim(5, 18000).subscribe();

    const req = httpMock.expectOne(API_ENDPOINTS.claims.approve(5));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ approvedAmount: 18000 });
    req.flush({ id: 5, status: 'APPROVED' });
  });

  it('trims the reason when rejecting a claim', () => {
    service.rejectClaim(5, '  Not covered  ').subscribe();

    const req = httpMock.expectOne(API_ENDPOINTS.claims.reject(5));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ reason: 'Not covered' });
    req.flush({ id: 5, status: 'REJECTED' });
  });

  it('settles and cancels claims with PUT requests', () => {
    service.settleClaim(5, 'Paid').subscribe();
    const settle = httpMock.expectOne(API_ENDPOINTS.claims.settle(5));
    expect(settle.request.method).toBe('PUT');
    expect(settle.request.body).toEqual({ notes: 'Paid' });
    settle.flush({});

    service.cancelClaim(6).subscribe();
    const cancel = httpMock.expectOne(API_ENDPOINTS.claims.cancel(6));
    expect(cancel.request.method).toBe('PUT');
    cancel.flush({ message: 'Cancelled' });
  });

  it('sends status and customerId filters for the admin claim list', () => {
    service.getAllClaims('SUBMITTED', 42).subscribe();

    const req = httpMock.expectOne(
      (request) => request.url === API_ENDPOINTS.claims.adminAll,
    );
    expect(req.request.params.get('status')).toBe('SUBMITTED');
    expect(req.request.params.get('customerId')).toBe('42');
    req.flush([]);
  });

  it('omits empty filters for the admin claim list', () => {
    service.getAllClaims().subscribe();

    const req = httpMock.expectOne(
      (request) => request.url === API_ENDPOINTS.claims.adminAll,
    );
    expect(req.request.params.keys()).toEqual([]);
    req.flush([]);
  });

  it('fetches review queues and timelines', () => {
    service.getSubmittedClaims().subscribe();
    httpMock.expectOne(API_ENDPOINTS.claims.reviewSubmitted).flush([]);

    service.getReviewHistory().subscribe();
    httpMock.expectOne(API_ENDPOINTS.claims.reviewHistory).flush([]);

    service.getMyClaimTimeline(9).subscribe();
    httpMock.expectOne(API_ENDPOINTS.claims.timeline(9)).flush([]);

    service.getAdminClaimTimeline(9).subscribe();
    httpMock.expectOne(API_ENDPOINTS.claims.adminTimeline(9)).flush([]);
  });
});
