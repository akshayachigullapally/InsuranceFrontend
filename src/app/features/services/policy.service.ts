import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  CreateCustomPolicyRequest,
  CreatePolicyRequest,
  MessageResponse,
  PolicyDecisionRequest,
  PolicyResponse,
  PolicyStatus,
  PolicyStatusHistoryResponse,
  PolicyTriggerSnapshotResponse,
} from '../dtos/policies/policy-response.dto';

@Injectable({ providedIn: 'root' })
export class PolicyService {
  constructor(private readonly http: HttpClient) {}

  getMyPolicies(status?: PolicyStatus): Observable<PolicyResponse[]> {
    const params = status
      ? new HttpParams().set('status', status)
      : undefined;

    return this.http.get<PolicyResponse[]>(
      API_ENDPOINTS.policies.myPolicies,
      { params },
    );
  }

  getMyPolicy(policyId: number): Observable<PolicyResponse> {
    return this.http.get<PolicyResponse>(
      API_ENDPOINTS.policies.getById(policyId),
    );
  }

  createPolicy(request: CreatePolicyRequest): Observable<PolicyResponse> {
    return this.http.post<PolicyResponse>(
      API_ENDPOINTS.policies.create,
      request,
    );
  }

  createCustomPolicy(
    request: CreateCustomPolicyRequest,
  ): Observable<PolicyResponse> {
    return this.http.post<PolicyResponse>(
      API_ENDPOINTS.policies.createCustom,
      request,
    );
  }

  cancelPolicy(policyId: number): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(
      API_ENDPOINTS.policies.cancel(policyId),
      {},
    );
  }

  getPendingPolicies(): Observable<PolicyResponse[]> {
    return this.http.get<PolicyResponse[]>(
      API_ENDPOINTS.policies.reviewPending,
    );
  }

  getAllPolicies(
    status?: PolicyStatus,
    customerId?: number,
  ): Observable<PolicyResponse[]> {
    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }

    if (customerId) {
      params = params.set('customerId', customerId);
    }

    return this.http.get<PolicyResponse[]>(
      API_ENDPOINTS.policies.adminAll,
      { params },
    );
  }

  getPolicy(policyId: number): Observable<PolicyResponse> {
    return this.http.get<PolicyResponse>(
      API_ENDPOINTS.policies.adminById(policyId),
    );
  }

  approvePolicy(policyId: number): Observable<PolicyResponse> {
    return this.http.put<PolicyResponse>(
      API_ENDPOINTS.policies.approve(policyId),
      {},
    );
  }

  rejectPolicy(
    policyId: number,
    reason: string,
  ): Observable<PolicyResponse> {
    const body: PolicyDecisionRequest = {
      reason: reason.trim(),
    };

    return this.http.put<PolicyResponse>(
      API_ENDPOINTS.policies.reject(policyId),
      body,
    );
  }

  getPolicyHistory(policyId: number): Observable<PolicyStatusHistoryResponse[]> {
    return this.http.get<PolicyStatusHistoryResponse[]>(
      API_ENDPOINTS.policies.history(policyId),
    );
  }

  getPolicySnapshot(policyId: number): Observable<PolicyTriggerSnapshotResponse> {
    return this.http.get<PolicyTriggerSnapshotResponse>(
      API_ENDPOINTS.policies.snapshot(policyId),
    );
  }
}