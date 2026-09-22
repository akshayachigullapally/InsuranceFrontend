import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  CurrentMeasurementRequest,
  CurrentMeasurementResult,
  CurrentMeasurementSnapshot,
} from '../dtos/triggers/current-measurement.dto';

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
}
