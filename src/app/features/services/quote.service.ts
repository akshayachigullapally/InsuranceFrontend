import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  CreateQuoteRequest,
  MessageResponse,
  QuoteResponse,
} from '../dtos/financial/quote-response.dto';

@Injectable({ providedIn: 'root' })
export class QuoteService {
  constructor(private readonly http: HttpClient) {}

  createQuote(request: CreateQuoteRequest): Observable<QuoteResponse> {
    return this.http.post<QuoteResponse>(
      API_ENDPOINTS.financial.quotes,
      request,
    );
  }

  getMyQuotes(): Observable<QuoteResponse[]> {
    return this.http.get<QuoteResponse[]>(
      API_ENDPOINTS.financial.myQuotes,
    );
  }

  getQuote(quoteId: number): Observable<QuoteResponse> {
    return this.http.get<QuoteResponse>(
      API_ENDPOINTS.financial.quoteById(quoteId),
    );
  }

  acceptQuote(quoteId: number): Observable<QuoteResponse> {
    return this.http.put<QuoteResponse>(
      API_ENDPOINTS.financial.acceptQuote(quoteId),
      {},
    );
  }

  cancelQuote(quoteId: number): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(
      API_ENDPOINTS.financial.cancelQuote(quoteId),
      {},
    );
  }
}
