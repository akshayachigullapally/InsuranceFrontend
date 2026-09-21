import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  MessageResponse,
  PaymentActionRequest,
  PaymentRequest,
  PaymentResponse,
} from '../dtos/financial/payment-response.dto';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private readonly http: HttpClient) {}

  createPayment(request: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(
      API_ENDPOINTS.financial.payments,
      request,
    );
  }

  getMyPayments(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(
      API_ENDPOINTS.financial.myPayments,
    );
  }

  getPayment(paymentId: number): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(
      API_ENDPOINTS.financial.paymentById(paymentId),
    );
  }

  getAllPayments(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(
      API_ENDPOINTS.financial.adminPayments,
    );
  }

  markSuccess(
    paymentId: number,
    request: PaymentActionRequest,
  ): Observable<PaymentResponse> {
    return this.http.put<PaymentResponse>(
      API_ENDPOINTS.financial.paymentSuccess(paymentId),
      request,
    );
  }

  markFail(
    paymentId: number,
    request: PaymentActionRequest,
  ): Observable<PaymentResponse> {
    return this.http.put<PaymentResponse>(
      API_ENDPOINTS.financial.paymentFail(paymentId),
      request,
    );
  }

  refundPayment(paymentId: number): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(
      API_ENDPOINTS.financial.paymentRefund(paymentId),
      {},
    );
  }
}
