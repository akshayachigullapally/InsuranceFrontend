import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { MessageResponse, MonitorRunResponse } from '../dtos/trigger-evaluations/monitor-run-response.dto';

@Injectable({ providedIn: 'root' })
export class MonitorRunService {
  constructor(private readonly http: HttpClient) {}

  getAllRuns(): Observable<MonitorRunResponse[]> {
    return this.http.get<MonitorRunResponse[]>(
      API_ENDPOINTS.triggers.monitorRuns.base,
    );
  }

  getRun(runId: number): Observable<MonitorRunResponse> {
    return this.http.get<MonitorRunResponse>(
      API_ENDPOINTS.triggers.monitorRuns.byId(runId),
    );
  }

  triggerScan(): Observable<MonitorRunResponse> {
    return this.http.post<MonitorRunResponse>(
      API_ENDPOINTS.triggers.monitorRuns.scan,
      {},
    );
  }
}