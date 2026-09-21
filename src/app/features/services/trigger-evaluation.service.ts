import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  TriggerEvaluationResponse,
} from '../dtos/trigger-evaluations/trigger-evaluation-response.dto';

@Injectable({ providedIn: 'root' })
export class TriggerEvaluationService {
  constructor(private readonly http: HttpClient) {}

  getAllEvaluations(): Observable<TriggerEvaluationResponse[]> {
    return this.http.get<TriggerEvaluationResponse[]>(
      API_ENDPOINTS.triggers.evaluations,
    );
  }

  getEvaluation(evaluationId: number): Observable<TriggerEvaluationResponse> {
    return this.http.get<TriggerEvaluationResponse>(
      API_ENDPOINTS.triggers.evaluationById(evaluationId),
    );
  }

  getEvaluationsByDefinition(
    definitionId: number,
  ): Observable<TriggerEvaluationResponse[]> {
    return this.http.get<TriggerEvaluationResponse[]>(
      API_ENDPOINTS.triggers.evaluationsByDefinition(definitionId),
    );
  }
}
