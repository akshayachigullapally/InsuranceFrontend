import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  MessageResponse,
  TriggerDefinitionManageableStatus,
  TriggerDefinitionRequest,
  TriggerDefinitionResponse,
  UpdateTriggerDefinitionStatusRequest,
} from '../dtos/trigger-definitions/trigger-definition-response.dto';

@Injectable({ providedIn: 'root' })
export class TriggerDefinitionService {
  constructor(private readonly http: HttpClient) {}

  getAllDefinitions(): Observable<TriggerDefinitionResponse[]> {
    return this.http.get<TriggerDefinitionResponse[]>(
      API_ENDPOINTS.triggers.definitions,
    );
  }

  getActiveDefinitions(): Observable<TriggerDefinitionResponse[]> {
    return this.http.get<TriggerDefinitionResponse[]>(
      API_ENDPOINTS.triggers.definitionsActive,
    );
  }

  getDefinition(definitionId: number): Observable<TriggerDefinitionResponse> {
    return this.http.get<TriggerDefinitionResponse>(
      API_ENDPOINTS.triggers.definitionById(definitionId),
    );
  }

  getDefinitionsByPeril(perilId: number): Observable<TriggerDefinitionResponse[]> {
    return this.http.get<TriggerDefinitionResponse[]>(
      API_ENDPOINTS.triggers.definitionsByPeril(perilId),
    );
  }

  getDefinitionsByZone(zoneId: number): Observable<TriggerDefinitionResponse[]> {
    return this.http.get<TriggerDefinitionResponse[]>(
      API_ENDPOINTS.triggers.definitionsByZone(zoneId),
    );
  }

  getDefinitionsByProduct(productId: number): Observable<TriggerDefinitionResponse[]> {
    return this.http.get<TriggerDefinitionResponse[]>(
      API_ENDPOINTS.triggers.definitionsByProduct(productId),
    );
  }

  createDefinition(
    request: TriggerDefinitionRequest,
  ): Observable<TriggerDefinitionResponse> {
    return this.http.post<TriggerDefinitionResponse>(
      API_ENDPOINTS.triggers.definitions,
      this.normalize(request),
    );
  }

  updateDefinition(
    definitionId: number,
    request: TriggerDefinitionRequest,
  ): Observable<TriggerDefinitionResponse> {
    return this.http.put<TriggerDefinitionResponse>(
      API_ENDPOINTS.triggers.definitionById(definitionId),
      this.normalize(request),
    );
  }

  updateDefinitionStatus(
    definitionId: number,
    status: TriggerDefinitionManageableStatus,
  ): Observable<TriggerDefinitionResponse> {
    const request: UpdateTriggerDefinitionStatusRequest = { status };

    return this.http.put<TriggerDefinitionResponse>(
      API_ENDPOINTS.triggers.definitionStatus(definitionId),
      request,
    );
  }

  archiveDefinition(definitionId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(
      API_ENDPOINTS.triggers.definitionById(definitionId),
    );
  }

  evaluateDefinition(
    definitionId: number,
    evaluationEnd?: string,
  ): Observable<unknown> {
    const body = evaluationEnd ? { evaluationEnd } : {};

    return this.http.post(
      API_ENDPOINTS.triggers.evaluate(definitionId),
      body,
    );
  }

  private normalize(request: TriggerDefinitionRequest): TriggerDefinitionRequest {
    return {
      ...request,
      definitionCode: request.definitionCode
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, ''),
      definitionName: request.definitionName.trim(),
      description: request.description.trim(),
      measurementType: request.measurementType,
      measurementUnit: request.measurementUnit,
      aggregationType: request.aggregationType,
      comparisonOperator: request.comparisonOperator,
      thresholdValue: Number(request.thresholdValue),
      observationWindowHours: Number(request.observationWindowHours),
      minimumObservationCount: Number(request.minimumObservationCount),
    };
  }
}
