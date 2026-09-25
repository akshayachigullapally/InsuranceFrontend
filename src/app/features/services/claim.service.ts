import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  ApproveClaimRequest,
  ClaimResponse,
  ClaimStatus,
  ClaimTimelineResponse,
  CreateClaimRequest,
  MessageResponse,
  RejectClaimRequest,
  SettleClaimRequest,
  ClaimReviewHistoryResponse,
} from '../dtos/claims/claim-response.dto';

@Injectable({ providedIn: 'root' })
export class ClaimService {
  constructor(private readonly http: HttpClient) {}

  getMyClaims(status?: ClaimStatus): Observable<ClaimResponse[]> {
    const params = status
      ? new HttpParams().set('status', status)
      : undefined;

    return this.http.get<ClaimResponse[]>(
      API_ENDPOINTS.claims.myClaims,
      { params },
    );
  }

  getMyClaim(claimId: number): Observable<ClaimResponse> {
    return this.http.get<ClaimResponse>(
      API_ENDPOINTS.claims.getById(claimId),
    );
  }

  createClaim(request: CreateClaimRequest): Observable<ClaimResponse> {
    return this.http.post<ClaimResponse>(
      API_ENDPOINTS.claims.create,
      request,
    );
  }

  cancelClaim(claimId: number): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(
      API_ENDPOINTS.claims.cancel(claimId),
      {},
    );
  }

  getSubmittedClaims(): Observable<ClaimResponse[]> {
    return this.http.get<ClaimResponse[]>(
      API_ENDPOINTS.claims.reviewSubmitted,
    );
  }

  getReviewHistory(): Observable<ClaimReviewHistoryResponse[]> {
    return this.http.get<ClaimReviewHistoryResponse[]>(
      API_ENDPOINTS.claims.reviewHistory,
    );
  }

  getReviewClaim(claimId: number): Observable<ClaimResponse> {
    return this.http.get<ClaimResponse>(
      API_ENDPOINTS.claims.reviewById(claimId),
    );
  }

  startReview(claimId: number): Observable<ClaimResponse> {
    return this.http.put<ClaimResponse>(
      API_ENDPOINTS.claims.startReview(claimId),
      {},
    );
  }

  approveClaim(
    claimId: number,
    approvedAmount: number,
  ): Observable<ClaimResponse> {
    const request: ApproveClaimRequest = { approvedAmount };

    return this.http.put<ClaimResponse>(
      API_ENDPOINTS.claims.approve(claimId),
      request,
    );
  }

  rejectClaim(
    claimId: number,
    reason: string,
  ): Observable<ClaimResponse> {
    const request: RejectClaimRequest = {
      reason: reason.trim(),
    };

    return this.http.put<ClaimResponse>(
      API_ENDPOINTS.claims.reject(claimId),
      request,
    );
  }

  settleClaim(
    claimId: number,
    notes?: string,
  ): Observable<ClaimResponse> {
    const request: SettleClaimRequest = { notes };

    return this.http.put<ClaimResponse>(
      API_ENDPOINTS.claims.settle(claimId),
      request,
    );
  }

  getMyClaimTimeline(claimId: number): Observable<ClaimTimelineResponse[]> {
    return this.http.get<ClaimTimelineResponse[]>(
      API_ENDPOINTS.claims.timeline(claimId),
    );
  }

  getAdminClaimTimeline(claimId: number): Observable<ClaimTimelineResponse[]> {
    return this.http.get<ClaimTimelineResponse[]>(
      API_ENDPOINTS.claims.adminTimeline(claimId),
    );
  }

  getAllClaims(
    status?: ClaimStatus,
    customerId?: number,
  ): Observable<ClaimResponse[]> {
    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }

    if (customerId) {
      params = params.set('customerId', customerId);
    }

    return this.http.get<ClaimResponse[]>(
      API_ENDPOINTS.claims.adminAll,
      { params },
    );
  }

  getAdminClaim(claimId: number): Observable<ClaimResponse> {
    return this.http.get<ClaimResponse>(
      API_ENDPOINTS.claims.adminById(claimId),
    );
  }
}