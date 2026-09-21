import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { MessageResponse, ObservationResponse, ObservationRejectRequest } from '../dtos/observations/observation-response.dto';

@Injectable({ providedIn: 'root' })
export class ObservationValidationService {
  constructor(private readonly http: HttpClient) {}

  getReceivedObservations(): Observable<ObservationResponse[]> {
    return this.http.get<ObservationResponse[]>(
      API_ENDPOINTS.triggers.observationValidation.received,
    );
  }

  validateObservation(observationId: number): Observable<ObservationResponse> {
    return this.http.put<ObservationResponse>(
      API_ENDPOINTS.triggers.observationValidation.validate(observationId),
      {},
    );
  }

  rejectObservation(
    observationId: number,
    request: ObservationRejectRequest,
  ): Observable<ObservationResponse> {
    return this.http.put<ObservationResponse>(
      API_ENDPOINTS.triggers.observationValidation.reject(observationId),
      request,
    );
  }

  validateAllReceived(): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      API_ENDPOINTS.triggers.observationValidation.validateAll,
      {},
    );
  }
}