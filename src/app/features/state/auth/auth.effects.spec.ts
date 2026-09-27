import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { AuthEffects } from './auth.effects';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { AuthResponse } from '../../dtos/auth/auth-response.dto';

const auth: AuthResponse = {
  accessToken: 'access',
  refreshToken: 'refresh',
  tokenType: 'Bearer',
  expiresIn: 3600,
  user: { id: 1, fullName: 'Asha', email: 'asha@example.com', role: 'ROLE_CUSTOMER' },
};

function collect(effect$: Observable<Action>): Action[] {
  const results: Action[] = [];
  effect$.subscribe((action) => results.push(action));
  return results;
}

describe('AuthEffects', () => {
  let actions$: Observable<Action>;
  let effects: AuthEffects;
  let authService: Record<string, ReturnType<typeof vi.fn>>;
  let tokenStorage: Record<string, ReturnType<typeof vi.fn>>;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = {
      login: vi.fn(),
      register: vi.fn(),
      refresh: vi.fn(),
      logout: vi.fn(),
      me: vi.fn(),
    };
    tokenStorage = {
      storeTokens: vi.fn(),
      getRefreshToken: vi.fn().mockReturnValue('refresh'),
      getAccessToken: vi.fn().mockReturnValue(null),
      hasTokens: vi.fn().mockReturnValue(true),
      clear: vi.fn(),
    };
    router = { navigate: vi.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        { provide: AuthService, useValue: authService },
        { provide: TokenStorageService, useValue: tokenStorage },
        { provide: Router, useValue: router },
      ],
    });
    effects = TestBed.inject(AuthEffects);
  });

  it('stores tokens and emits loginSuccess when login succeeds', () => {
    authService['login'].mockReturnValue(of(auth));
    actions$ = of(AuthActions.login({ request: { email: 'asha@example.com', password: 'secret' } }));

    expect(collect(effects.login$)).toEqual([AuthActions.loginSuccess({ auth })]);
    expect(tokenStorage['storeTokens']).toHaveBeenCalledWith('access', 'refresh');
  });

  it('emits loginFailure with the server message when login fails', () => {
    authService['login'].mockReturnValue(throwError(() => ({ error: { message: 'Invalid credentials' } })));
    actions$ = of(AuthActions.login({ request: { email: 'x@example.com', password: 'bad' } }));

    expect(collect(effects.login$)).toEqual([AuthActions.loginFailure({ error: 'Invalid credentials' })]);
    expect(tokenStorage['storeTokens']).not.toHaveBeenCalled();
  });

  it('joins validation messages when register fails', () => {
    authService['register'].mockReturnValue(
      throwError(() => ({ error: { messages: ['Email taken', 'Weak password'] } })),
    );
    actions$ = of(AuthActions.register({ request: { fullName: 'A', email: 'a@b.com', password: 'x' } }));

    expect(collect(effects.register$)).toEqual([
      AuthActions.registerFailure({ error: 'Email taken. Weak password' }),
    ]);
  });

  it('fails the refresh without calling the API when there is no refresh token', () => {
    tokenStorage['getRefreshToken'].mockReturnValue(null);
    actions$ = of(AuthActions.refreshToken());

    expect(collect(effects.refreshToken$)).toEqual([
      AuthActions.refreshTokenFailure({ error: 'No refresh token available.' }),
    ]);
    expect(authService['refresh']).not.toHaveBeenCalled();
  });

  it('fails restoreSession when no tokens are saved', () => {
    tokenStorage['hasTokens'].mockReturnValue(false);
    actions$ = of(AuthActions.restoreSession());

    expect(collect(effects.restoreSession$)).toEqual([
      AuthActions.restoreSessionFailure({ error: 'No saved session.' }),
    ]);
  });

  it('restores the session from /me', () => {
    authService['me'].mockReturnValue(of(auth.user));
    actions$ = of(AuthActions.restoreSession());

    expect(collect(effects.restoreSession$)).toEqual([
      AuthActions.restoreSessionSuccess({ user: auth.user, customerId: undefined }),
    ]);
  });

  it('clears tokens and succeeds logout even when the API call fails', () => {
    authService['logout'].mockReturnValue(throwError(() => new Error('offline')));
    actions$ = of(AuthActions.logout());

    expect(collect(effects.logout$)).toEqual([AuthActions.logoutSuccess()]);
    expect(tokenStorage['clear']).toHaveBeenCalled();
  });

  it('navigates to the role dashboard after login', () => {
    actions$ = of(AuthActions.loginSuccess({ auth }));

    collect(effects.redirectAfterLogin$ as Observable<Action>);

    expect(router.navigate).toHaveBeenCalledWith(['/customer/dashboard']);
  });

  it('navigates to /welcome for an unknown role', () => {
    actions$ = of(AuthActions.loginSuccess({ auth: { ...auth, user: { ...auth.user, role: 'ROLE_UNKNOWN' } } }));

    collect(effects.redirectAfterLogin$ as Observable<Action>);

    expect(router.navigate).toHaveBeenCalledWith(['/welcome']);
  });

  it('clears tokens and goes to /login after logout', () => {
    actions$ = of(AuthActions.logoutSuccess());

    collect(effects.redirectAfterLogout$ as Observable<Action>);

    expect(tokenStorage['clear']).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
