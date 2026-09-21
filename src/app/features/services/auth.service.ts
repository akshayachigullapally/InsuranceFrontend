import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { RegisterRequest } from '../dtos/auth/register-request.dto';
import { LoginRequest } from '../dtos/auth/login-request.dto';
import { RefreshTokenRequest } from '../dtos/auth/refresh-token-request.dto';
import { AuthResponse } from '../dtos/auth/auth-response.dto';
import { MessageResponse } from '../dtos/auth/message-response.dto';
import { UserResponse } from '../dtos/auth/user-response.dto';
import { SessionResponse } from '../dtos/auth/session-response.dto';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly http: HttpClient) {}

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.auth.register, request);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.auth.login, request);
  }

  refresh(request: RefreshTokenRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.auth.refresh, request);
  }

  logout(refreshToken: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(API_ENDPOINTS.auth.logout, { refreshToken });
  }

  me(): Observable<UserResponse> {
    return this.http.get<UserResponse>(API_ENDPOINTS.auth.me);
  }

  getSessions(): Observable<SessionResponse[]> {
    return this.http.get<SessionResponse[]>(API_ENDPOINTS.auth.sessions);
  }

  revokeSession(sessionId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(API_ENDPOINTS.auth.revokeSession(sessionId));
  }
}