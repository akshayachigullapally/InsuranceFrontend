import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  MessageResponse,
  UpdateZoneStatusRequest,
  ZoneManageableStatus,
  ZoneRequest,
  ZoneResponse,
} from '../dtos/zones/zone-response.dto';

@Injectable({ providedIn: 'root' })
export class ZoneService {
  constructor(private readonly http: HttpClient) {}

  getAllZones(state?: string): Observable<ZoneResponse[]> {
    const value = state?.trim();
    const params = value
      ? new HttpParams().set('state', value)
      : undefined;

    return this.http.get<ZoneResponse[]>(
      API_ENDPOINTS.triggers.zones,
      { params },
    );
  }

  getActiveZones(): Observable<ZoneResponse[]> {
    return this.http.get<ZoneResponse[]>(
      API_ENDPOINTS.triggers.zonesActive,
    );
  }

  getZone(zoneId: number): Observable<ZoneResponse> {
    return this.http.get<ZoneResponse>(
      API_ENDPOINTS.triggers.zoneById(zoneId),
    );
  }

  createZone(request: ZoneRequest): Observable<ZoneResponse> {
    return this.http.post<ZoneResponse>(
      API_ENDPOINTS.triggers.zones,
      this.normalize(request),
    );
  }

  updateZone(
    zoneId: number,
    request: ZoneRequest,
  ): Observable<ZoneResponse> {
    return this.http.put<ZoneResponse>(
      API_ENDPOINTS.triggers.zoneById(zoneId),
      this.normalize(request),
    );
  }

  updateZoneStatus(
    zoneId: number,
    status: ZoneManageableStatus,
  ): Observable<ZoneResponse> {
    const request: UpdateZoneStatusRequest = { status };

    return this.http.put<ZoneResponse>(
      API_ENDPOINTS.triggers.zoneStatus(zoneId),
      request,
    );
  }

  archiveZone(zoneId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(
      API_ENDPOINTS.triggers.zoneById(zoneId),
    );
  }

  private normalize(request: ZoneRequest): ZoneRequest {
    return {
      zoneCode: request.zoneCode
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, ''),
      zoneName: request.zoneName.trim(),
      country: request.country.trim(),
      state: request.state.trim(),
      district: request.district.trim(),
      postalCode: request.postalCode?.trim() || undefined,
      latitude: Number(request.latitude),
      longitude: Number(request.longitude),
      radiusKm: Number(request.radiusKm),
    };
  }
}