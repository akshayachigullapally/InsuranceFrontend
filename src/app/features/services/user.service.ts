import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  CustomerSegment,
  UpdateUserStatusRequest,
  UserResponse,
  UserStatus,
} from '../dtos/auth/user-response.dto';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private readonly http: HttpClient) {}

  getAllUsers(
    status?: UserStatus,
    segment?: CustomerSegment,
  ): Observable<UserResponse[]> {
    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }

    if (segment) {
      params = params.set('segment', segment);
    }

    return this.http.get<UserResponse[]>(
      API_ENDPOINTS.users.getAll,
      { params },
    );
  }

  getUser(userId: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(
      API_ENDPOINTS.users.getById(userId),
    );
  }

  updateUserStatus(
    userId: number,
    status: UserStatus,
  ): Observable<UserResponse> {
    const request: UpdateUserStatusRequest = { status };

    return this.http.put<UserResponse>(
      API_ENDPOINTS.users.updateStatus(userId),
      request,
    );
  }
}