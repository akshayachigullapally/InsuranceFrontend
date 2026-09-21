import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  MessageResponse,
  PricingRuleManageableStatus,
  PricingRuleRequest,
  PricingRuleResponse,
  UpdatePricingRuleStatusRequest,
} from '../dtos/financial/pricing-rule-response.dto';

@Injectable({ providedIn: 'root' })
export class PricingRuleService {
  constructor(private readonly http: HttpClient) {}

  getAllRules(): Observable<PricingRuleResponse[]> {
    return this.http.get<PricingRuleResponse[]>(
      API_ENDPOINTS.financial.pricingRules,
    );
  }

  getRule(ruleId: number): Observable<PricingRuleResponse> {
    return this.http.get<PricingRuleResponse>(
      API_ENDPOINTS.financial.pricingRuleById(ruleId),
    );
  }

  createRule(request: PricingRuleRequest): Observable<PricingRuleResponse> {
    return this.http.post<PricingRuleResponse>(
      API_ENDPOINTS.financial.pricingRules,
      this.normalize(request),
    );
  }

  updateRule(
    ruleId: number,
    request: PricingRuleRequest,
  ): Observable<PricingRuleResponse> {
    return this.http.put<PricingRuleResponse>(
      API_ENDPOINTS.financial.pricingRuleById(ruleId),
      this.normalize(request),
    );
  }

  updateStatus(
    ruleId: number,
    status: PricingRuleManageableStatus,
  ): Observable<PricingRuleResponse> {
    const request: UpdatePricingRuleStatusRequest = { status };
    return this.http.put<PricingRuleResponse>(
      API_ENDPOINTS.financial.pricingRuleStatus(ruleId),
      request,
    );
  }

  archiveRule(ruleId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(
      API_ENDPOINTS.financial.pricingRuleById(ruleId),
    );
  }

  private normalize(request: PricingRuleRequest): PricingRuleRequest {
    return {
      ...request,
      effectiveFrom: request.effectiveFrom?.trim() ?? request.effectiveFrom,
      effectiveTo: request.effectiveTo?.trim() ?? request.effectiveTo,
    };
  }
}
