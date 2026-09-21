import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  TriggerEventDecisionRequest,
  TriggerEventResponse,
} from '../dtos/trigger-events/trigger-event-response.dto';

@Injectable({ providedIn: 'root' })
export class TriggerEventService {
  constructor(private readonly http: HttpClient) {}

  getAllEvents(): Observable<TriggerEventResponse[]> {
    return this.http.get<TriggerEventResponse[]>(
      API_ENDPOINTS.triggers.events,
    );
  }

  getEvent(eventId: number): Observable<TriggerEventResponse> {
    return this.http.get<TriggerEventResponse>(
      API_ENDPOINTS.triggers.eventById(eventId),
    );
  }

  getEventsByStatus(status: string): Observable<TriggerEventResponse[]> {
    return this.http.get<TriggerEventResponse[]>(
      API_ENDPOINTS.triggers.eventsByStatus(status),
    );
  }

  getEventsByDefinition(definitionId: number): Observable<TriggerEventResponse[]> {
    return this.http.get<TriggerEventResponse[]>(
      API_ENDPOINTS.triggers.eventsByDefinition(definitionId),
    );
  }

  getEventsByProduct(productId: number): Observable<TriggerEventResponse[]> {
    return this.http.get<TriggerEventResponse[]>(
      API_ENDPOINTS.triggers.eventsByProduct(productId),
    );
  }

  getEventsByZone(zoneId: number): Observable<TriggerEventResponse[]> {
    return this.http.get<TriggerEventResponse[]>(
      API_ENDPOINTS.triggers.eventsByZone(zoneId),
    );
  }

  startValidation(eventId: number): Observable<TriggerEventResponse> {
    return this.http.put<TriggerEventResponse>(
      API_ENDPOINTS.triggers.eventStartValidation(eventId),
      {},
    );
  }

  verifyEvent(
    eventId: number,
    reviewNotes: string,
  ): Observable<TriggerEventResponse> {
    const request: TriggerEventDecisionRequest = { reviewNotes };

    return this.http.put<TriggerEventResponse>(
      API_ENDPOINTS.triggers.eventVerify(eventId),
      request,
    );
  }

  rejectEvent(
    eventId: number,
    reviewNotes: string,
  ): Observable<TriggerEventResponse> {
    const request: TriggerEventDecisionRequest = { reviewNotes };

    return this.http.put<TriggerEventResponse>(
      API_ENDPOINTS.triggers.eventReject(eventId),
      request,
    );
  }
}
