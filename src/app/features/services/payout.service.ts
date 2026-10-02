import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  CreatePayoutRequest,
  PayoutActionRequest,
  PayoutResponse,
} from '../dtos/financial/payout-response.dto';

@Injectable({ providedIn: 'root' })
export class PayoutService {
  constructor(private readonly http: HttpClient) {}

  createPayout(request: CreatePayoutRequest): Observable<PayoutResponse> {
    return this.http.post<PayoutResponse>(API_ENDPOINTS.financial.payouts, request);
  }

  getMyPayouts(): Observable<PayoutResponse[]> {
    return this.http.get<PayoutResponse[]>(API_ENDPOINTS.financial.myPayouts);
  }

  getPayout(payoutId: number): Observable<PayoutResponse> {
    return this.http.get<PayoutResponse>(API_ENDPOINTS.financial.payoutById(payoutId));
  }

  getAllPayouts(): Observable<PayoutResponse[]> {
    return this.http.get<PayoutResponse[]>(API_ENDPOINTS.financial.adminPayouts);
  }

  retryPayout(payoutId: number, request: PayoutActionRequest): Observable<PayoutResponse> {
    return this.http.put<PayoutResponse>(API_ENDPOINTS.financial.payoutRetry(payoutId), request);
  }

  downloadReceipt(payoutId: number): Observable<Blob> {
    return this.http.get(API_ENDPOINTS.financial.payoutReceipt(payoutId), { responseType: 'blob' });
  }

  downloadAdminReceipt(payoutId: number): Observable<Blob> {
    return this.http.get(API_ENDPOINTS.financial.adminPayoutReceipt(payoutId), {
      responseType: 'blob',
    });
  }
}
