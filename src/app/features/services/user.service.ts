import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  CustomerSegment,
  UpdateUserStatusRequest,
  UserResponse,
  UserStatus,
} from '../dtos/auth/user-response.dto';
import { UpdateProfileRequest } from '../dtos/auth/update-profile-request.dto';

@Injectable({ providedIn: 'root' })
export class UserService {
  // One request per user id, shared by every list row that shows that user's name.
  private readonly userNames = new Map<number, Observable<string | null>>();

  constructor(private readonly http: HttpClient) {}

  getMyProfile(): Observable<UserResponse> {
    return this.http.get<UserResponse>(API_ENDPOINTS.users.me);
  }

  updateMyProfile(request: UpdateProfileRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(API_ENDPOINTS.users.me, request);
  }

  getAllUsers(status?: UserStatus, segment?: CustomerSegment): Observable<UserResponse[]> {
    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }

    if (segment) {
      params = params.set('segment', segment);
    }

    return this.http.get<UserResponse[]>(API_ENDPOINTS.users.getAll, { params });
  }

  getUser(userId: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(API_ENDPOINTS.users.getById(userId));
  }

  getUserName(userId: number): Observable<string | null> {
    let name$ = this.userNames.get(userId);
    if (!name$) {
      name$ = this.getUser(userId).pipe(
        map((user) => user.fullName || null),
        catchError(() => of(null)),
        shareReplay(1),
      );
      this.userNames.set(userId, name$);
    }
    return name$;
  }

  updateUserStatus(userId: number, status: UserStatus): Observable<UserResponse> {
    const request: UpdateUserStatusRequest = { status };

    return this.http.put<UserResponse>(API_ENDPOINTS.users.updateStatus(userId), request);
  }
}
