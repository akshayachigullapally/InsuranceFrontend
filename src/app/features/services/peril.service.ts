import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  MessageResponse,
  PerilManageableStatus,
  PerilRequest,
  PerilResponse,
  UpdatePerilStatusRequest,
} from '../dtos/perils/peril-response.dto';

@Injectable({ providedIn: 'root' })
export class PerilService {
  constructor(private readonly http: HttpClient) {}

  getAllPerils(): Observable<PerilResponse[]> {
    return this.http.get<PerilResponse[]>(
      API_ENDPOINTS.triggers.perils,
    );
  }

  getPeril(perilId: number): Observable<PerilResponse> {
    return this.http.get<PerilResponse>(
      API_ENDPOINTS.triggers.perilById(perilId),
    );
  }

  createPeril(request: PerilRequest): Observable<PerilResponse> {
    return this.http.post<PerilResponse>(
      API_ENDPOINTS.triggers.perils,
      this.normalize(request),
    );
  }

  updatePeril(
    perilId: number,
    request: PerilRequest,
  ): Observable<PerilResponse> {
    return this.http.put<PerilResponse>(
      API_ENDPOINTS.triggers.perilById(perilId),
      this.normalize(request),
    );
  }

  updatePerilStatus(
    perilId: number,
    status: PerilManageableStatus,
  ): Observable<PerilResponse> {
    const request: UpdatePerilStatusRequest = { status };

    return this.http.put<PerilResponse>(
      API_ENDPOINTS.triggers.perilStatus(perilId),
      request,
    );
  }

  archivePeril(perilId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(
      API_ENDPOINTS.triggers.perilById(perilId),
    );
  }

  private normalize(request: PerilRequest): PerilRequest {
    return {
      perilCode: request.perilCode
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, ''),
      perilName: request.perilName.trim(),
      description: request.description.trim(),
    };
  }
}
