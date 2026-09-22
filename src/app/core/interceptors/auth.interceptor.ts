// import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { BehaviorSubject, Observable, catchError, filter, share, switchMap, take, throwError } from 'rxjs';
// import { tap } from 'rxjs/operators';
// import { AuthService } from '../../features/services/auth.service';
// import { TokenStorageService } from '../services/token-storage.service';
// import { AuthResponse } from '../../features/dtos/auth/auth-response.dto';

// const PUBLIC_URLS = ['/api/auth/register', '/api/auth/login', '/api/auth/refresh'];

// function isPublicRequest(url: string): boolean {
//   return PUBLIC_URLS.some((path) => url.includes(path));
// }

// const isRefreshing = new BehaviorSubject<boolean>(false);
// let refreshRequest: Observable<AuthResponse> | null = null;

// export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
//   const tokenStorage = inject(TokenStorageService);
//   const authService = inject(AuthService);

//   if (isPublicRequest(req.url)) {
//     return next(req);
//   }

//   const token = tokenStorage.getAccessToken();
//   let authReq = req;
//   if (token) {
//     authReq = req.clone({
//       setHeaders: { Authorization: `Bearer ${token}` },
//     });
//   }

//   return next(authReq).pipe(
//     catchError((error) => {
//       if (error && error.status === 401 && token) {
//         return handle401(req, next, authService, tokenStorage);
//       }
//       return throwError(() => error);
//     }),
//   );
// };

// function handle401(
//   req: HttpRequest<unknown>,
//   next: HttpHandlerFn,
//   authService: AuthService,
//   tokenStorage: TokenStorageService,
// ): Observable<HttpEvent<unknown>> {
//   if (isRefreshing.getValue() && refreshRequest) {
//     return refreshRequest.pipe(
//       filter((auth): auth is AuthResponse => !!auth),
//       switchMap((auth) =>
//         next(
//           req.clone({
//             setHeaders: { Authorization: `Bearer ${auth.accessToken}` },
//           }),
//         ),
//       ),
//     );
//   }

//   const refreshToken = tokenStorage.getRefreshToken();
//   if (!refreshToken) {
//     tokenStorage.clear();
//     return throwError(() => new Error('No refresh token available.'));
//   }

//   isRefreshing.next(true);
//   refreshRequest = authService.refresh({ refreshToken }).pipe(
//     tapStore(tokenStorage),
//     share(),
//   );

//   return refreshRequest.pipe(
//     switchMap((auth) =>
//       next(
//         req.clone({
//           setHeaders: { Authorization: `Bearer ${auth.accessToken}` },
//         }),
//       ),
//     ),
//     take(1),
//     catchError((err) => {
//       isRefreshing.next(false);
//       refreshRequest = null;
//       tokenStorage.clear();
//       return throwError(() => err);
//     }),
//   );
// }

// function tapStore(
//   tokenStorage: TokenStorageService,
// ): (source: Observable<AuthResponse>) => Observable<AuthResponse> {
//   return tap((auth) => {
//     tokenStorage.storeTokens(auth.accessToken, auth.refreshToken);
//     isRefreshing.next(false);
//   });
// }
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  Observable,
  catchError,
  finalize,
  shareReplay,
  switchMap,
  throwError,
} from 'rxjs';
import { AuthResponse } from '../../features/dtos/auth/auth-response.dto';
import { AuthService } from '../../features/services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

const PUBLIC_PATHS = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/refresh',
];

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
  const authenticatedRequest = accessToken
    ? addAuthorizationHeader(req, accessToken)
    : req;

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

      return refreshAndRetry(
        req,
        next,
        authService,
        tokenStorage,
        refreshToken,
      );
    }),
  );
};

function refreshAndRetry(
  originalRequest: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  tokenStorage: TokenStorageService,
  refreshToken: string,
): Observable<HttpEvent<unknown>> {
  if (!refreshRequest) {
    refreshRequest = authService.refresh({ refreshToken }).pipe(
      switchMap((auth: AuthResponse) => {
        tokenStorage.storeTokens(
          auth.accessToken,
          auth.refreshToken,
        );

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

  return refreshRequest.pipe(
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