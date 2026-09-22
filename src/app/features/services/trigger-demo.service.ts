import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  DemoSimulationRequest,
  DemoSimulationResult,
  VerifiedEventProcessingResponse,
  TriggerEvaluationResponse,
} from '../dtos/triggers/measurement-status.dto';

@Injectable({ providedIn: 'root' })
export class TriggerDemoService {
  constructor(private readonly http: HttpClient) {}

  simulateThresholdCrossing(
    request: DemoSimulationRequest,
  ): Observable<DemoSimulationResult[]> {
    return this.http.post<DemoSimulationResult[]>(
      API_ENDPOINTS.triggers.demoSimulate,
      request,
    );
  }

  verifyEvent(eventId: number): Observable<VerifiedEventProcessingResponse> {
    return this.http.post<VerifiedEventProcessingResponse>(
      API_ENDPOINTS.triggers.eventVerify(eventId),
      {},
    );
  }

  rejectEvent(eventId: number): Observable<TriggerEvaluationResponse> {
    return this.http.post<TriggerEvaluationResponse>(
      API_ENDPOINTS.triggers.eventReject(eventId),
      {},
    );
  }
}