import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthResponse } from '../../features/dtos/auth/auth-response.dto';
import { AuthService } from '../../features/services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

const PUBLIC_PATHS = ['/api/auth/register', '/api/auth/login', '/api/auth/refresh'];

let refreshRequest: Observable<AuthResponse> | null = null;

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);

  if (isPublicRequest(req.url)) {
    return next(req);
  }

  const accessToken = tokenStorage.getAccessToken();
  const storedRefreshToken = tokenStorage.getRefreshToken();
  // An expired token would only get a 401: refresh first, then send the request.
  if (accessToken && storedRefreshToken && tokenStorage.isAccessTokenExpired()) {
    return refreshAndRetry(req, next, authService, tokenStorage, storedRefreshToken);
  }
  const authenticatedRequest = accessToken ? addAuthorizationHeader(req, accessToken) : req;

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (isMeRequest(req.url)) {
        return throwError(() => error);
      }

      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        tokenStorage.clear();
        return throwError(() => error);
      }

      return refreshAndRetry(req, next, authService, tokenStorage, refreshToken);
    }),
  );
};

/** Refreshes the access token; callers at the same time share one refresh request. */
export function refreshAccessToken(
  authService: AuthService,
  tokenStorage: TokenStorageService,
  refreshToken: string,
): Observable<AuthResponse> {
  if (!refreshRequest) {
    refreshRequest = authService.refresh({ refreshToken }).pipe(
      switchMap((auth: AuthResponse) => {
        tokenStorage.storeTokens(auth.accessToken, auth.refreshToken);
        return [auth];
      }),
      shareReplay({
        bufferSize: 1,
        refCount: false,
      }),
      finalize(() => {
        refreshRequest = null;
      }),
    );
  }
  return refreshRequest;
}

function refreshAndRetry(
  originalRequest: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  tokenStorage: TokenStorageService,
  refreshToken: string,
): Observable<HttpEvent<unknown>> {
  return refreshAccessToken(authService, tokenStorage, refreshToken).pipe(
    switchMap((auth: AuthResponse) =>
      next(addAuthorizationHeader(originalRequest, auth.accessToken)),
    ),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        tokenStorage.clear();
      }
      return throwError(() => error);
    }),
  );
}

function addAuthorizationHeader(
  request: HttpRequest<unknown>,
  accessToken: string,
): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

function isPublicRequest(url: string): boolean {
  const path = getRequestPath(url);
  return PUBLIC_PATHS.includes(path);
}

function getRequestPath(url: string): string {
  try {
    return new URL(url, window.location.origin).pathname;
  } catch {
    return url.split('?')[0];
  }
}

function isMeRequest(url: string): boolean {
  return getRequestPath(url) === '/api/auth/me';
}
