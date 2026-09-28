import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import {
  loadCurrentUser,
  loadCurrentUserFailure,
  loadCurrentUserSuccess,
  login,
  loginFailure,
  loginSuccess,
  logout,
  logoutSuccess,
  refreshToken,
  refreshTokenFailure,
  refreshTokenSuccess,
  register,
  registerFailure,
  registerSuccess,
  restoreSession,
  restoreSessionFailure,
  restoreSessionSuccess,
} from './auth.actions';
import { ROLE_DASHBOARD_PATHS, UserRole } from '../../../core/constants/roles';
import { JwtClaims } from '../../../core/models/jwt-claims.model';

@Injectable()
export class AuthEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly authService: AuthService,
    private readonly tokenStorage: TokenStorageService,
    private readonly router: Router,
  ) {}

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      exhaustMap(({ request }) =>
        this.authService.login(request).pipe(
          map((auth) => {
            this.tokenStorage.storeTokens(auth.accessToken, auth.refreshToken);
            return loginSuccess({ auth });
          }),
          catchError((err) => of(loginFailure({ error: this.errorMessage(err) }))),
        ),
      ),
    ),
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(register),
      exhaustMap(({ request }) =>
        this.authService.register(request).pipe(
          map((auth) => {
            this.tokenStorage.storeTokens(auth.accessToken, auth.refreshToken);
            return registerSuccess({ auth });
          }),
          catchError((err) => of(registerFailure({ error: this.errorMessage(err) }))),
        ),
      ),
    ),
  );

  loadCurrentUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCurrentUser),
      mergeMap(() =>
        this.authService.me().pipe(
          map((user) =>
            loadCurrentUserSuccess({ user, customerId: this.tokenClaims()?.customerId }),
          ),
          catchError((err) => of(loadCurrentUserFailure({ error: this.errorMessage(err) }))),
        ),
      ),
    ),
  );

  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(refreshToken),
      switchMap(() => {
        const refreshToken = this.tokenStorage.getRefreshToken();
        if (!refreshToken) {
          return of(refreshTokenFailure({ error: 'No refresh token available.' }));
        }
        return this.authService.refresh({ refreshToken }).pipe(
          map((auth) => {
            this.tokenStorage.storeTokens(auth.accessToken, auth.refreshToken);
            return refreshTokenSuccess({ auth });
          }),
          catchError((err) => of(refreshTokenFailure({ error: this.errorMessage(err) }))),
        );
      }),
    ),
  );

  restoreSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(restoreSession),
      switchMap(() => {
        if (!this.tokenStorage.hasTokens()) {
          return of(restoreSessionFailure({ error: 'No saved session.' }));
        }
        return this.authService.me().pipe(
          map((user) =>
            restoreSessionSuccess({ user, customerId: this.tokenClaims()?.customerId }),
          ),
          catchError(() => {
            const claims = this.tokenClaims();
            if (claims) {
              return of(
                restoreSessionSuccess({
                  user: {
                    id: Number(claims.sub),
                    fullName: '',
                    email: claims.email,
                    role: claims.role,
                  },
                  customerId: claims.customerId,
                }),
              );
            }
            this.tokenStorage.clear();
            return of(restoreSessionFailure({ error: 'Session could not be restored.' }));
          }),
        );
      }),
    ),
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logout),
      exhaustMap(() => {
        const refreshToken = this.tokenStorage.getRefreshToken();
        if (!refreshToken) {
          this.tokenStorage.clear();
          return of(logoutSuccess());
        }
        return this.authService.logout(refreshToken).pipe(
          map(() => logoutSuccess()),
          catchError(() => {
            this.tokenStorage.clear();
            return of(logoutSuccess());
          }),
        );
      }),
    ),
  );

  redirectAfterLogin$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess, registerSuccess),
        tap(({ auth }) => {
          const role = auth.user.role ?? this.tokenClaims()?.role;
          const path = ROLE_DASHBOARD_PATHS[role as UserRole] ?? '/welcome';
          void this.router.navigate([path]);
        }),
      ),
    { dispatch: false },
  );

  redirectAfterLogout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logoutSuccess),
        tap(() => {
          this.tokenStorage.clear();
          void this.router.navigate(['/login']);
        }),
      ),
    { dispatch: false },
  );

  redirectToLoginOnFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(refreshTokenFailure, loadCurrentUserFailure, restoreSessionFailure),
        tap(() => {
          this.tokenStorage.clear();
          void this.router.navigate(['/login']);
        }),
      ),
    { dispatch: false },
  );

  private tokenClaims(): JwtClaims | null {
    const token = this.tokenStorage.getAccessToken();
    if (!token) {
      return null;
    }
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const normalized = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const payload = decodeURIComponent(
        atob(normalized)
          .split('')
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join(''),
      );
      return JSON.parse(payload) as JwtClaims;
    } catch {
      return null;
    }
  }

  private errorMessage(err: unknown): string {
    const e = err as { error?: { message?: string; messages?: string[] }; message?: string };
    if (e?.error?.messages?.length) {
      return e.error.messages.join('. ');
    }
    if (e?.error?.message) {
      return e.error.message;
    }
    if (e?.message) {
      return e.message;
    }
    return 'An unexpected error occurred.';
  }
}
