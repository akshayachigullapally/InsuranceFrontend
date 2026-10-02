import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  CurrentMeasurementRequest,
  CurrentMeasurementResult,
  CurrentMeasurementSnapshot,
  ZoneMeasurement,
} from '../dtos/triggers/current-measurement.dto';
import { ManualReadingRequest, ManualReadingResponse } from '../dtos/triggers/measurement-status.dto';

@Injectable({ providedIn: 'root' })
export class CurrentMeasurementService {
  constructor(private readonly http: HttpClient) {}

  process(request: CurrentMeasurementRequest): Observable<CurrentMeasurementResult> {
    return this.http.put<CurrentMeasurementResult>(
      API_ENDPOINTS.triggers.currentMeasurements,
      request,
    );
  }

  getCurrentMeasurements(): Observable<CurrentMeasurementSnapshot[]> {
    return this.http.get<CurrentMeasurementSnapshot[]>(
      API_ENDPOINTS.triggers.currentMeasurementsList,
    );
  }

  /** Admin sets the live reading of one measurement type in every active zone. */
  setCurrentReading(request: ManualReadingRequest): Observable<ManualReadingResponse> {
    return this.http.put<ManualReadingResponse>(API_ENDPOINTS.triggers.currentReading, request);
  }

  /** Latest validated reading of every measurement type in every zone. */
  getZoneMeasurements(): Observable<ZoneMeasurement[]> {
    return this.http.get<ZoneMeasurement[]>(API_ENDPOINTS.triggers.zoneMeasurements);
  }
}
