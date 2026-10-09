import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { TriggerEventResponse } from '../dtos/trigger-events/trigger-event-response.dto';

/** The fields of GET /api/triggers/definitions/{id} the UI shows. */
export interface TriggerDefinitionSummary {
  id: number;
  definitionCode: string;
  definitionName: string;
}

@Injectable({ providedIn: 'root' })
export class TriggerEventService {
  constructor(private readonly http: HttpClient) {}

  getAllEvents(): Observable<TriggerEventResponse[]> {
    return this.http.get<TriggerEventResponse[]>(API_ENDPOINTS.triggers.events);
  }

  getEvent(eventId: number): Observable<TriggerEventResponse> {
    return this.http.get<TriggerEventResponse>(API_ENDPOINTS.triggers.eventById(eventId));
  }

  getTriggerDefinition(definitionId: number): Observable<TriggerDefinitionSummary> {
    return this.http.get<TriggerDefinitionSummary>(
      API_ENDPOINTS.triggers.definitionById(definitionId),
    );
  }
}
