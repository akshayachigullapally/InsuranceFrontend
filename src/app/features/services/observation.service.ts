import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  CreateObservationRequest,
  ObservationResponse,
} from '../dtos/observations/observation-response.dto';

@Injectable({ providedIn: 'root' })
export class ObservationService {
  constructor(private readonly http: HttpClient) {}

  getAllObservations(): Observable<ObservationResponse[]> {
    return this.http.get<ObservationResponse[]>(
      API_ENDPOINTS.triggers.observations,
    );
  }

  getObservation(observationId: number): Observable<ObservationResponse> {
    return this.http.get<ObservationResponse>(
      API_ENDPOINTS.triggers.observationById(observationId),
    );
  }

  getObservationsByZone(zoneId: number): Observable<ObservationResponse[]> {
    return this.http.get<ObservationResponse[]>(
      API_ENDPOINTS.triggers.observationsByZone(zoneId),
    );
  }

  getObservationsByMeasurement(
    measurementType: string,
  ): Observable<ObservationResponse[]> {
    return this.http.get<ObservationResponse[]>(
      API_ENDPOINTS.triggers.observationsByMeasurement(measurementType),
    );
  }

  createObservation(
    request: CreateObservationRequest,
  ): Observable<ObservationResponse> {
    return this.http.post<ObservationResponse>(
      API_ENDPOINTS.triggers.observations,
      request,
    );
  }
}
