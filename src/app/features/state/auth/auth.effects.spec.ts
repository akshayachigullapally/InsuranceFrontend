import { TestBed } from '@angular/core/testing';
import { DefaultUrlSerializer, Router } from '@angular/router';
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
  let router: {
    url: string;
    navigate: ReturnType<typeof vi.fn>;
    navigateByUrl: ReturnType<typeof vi.fn>;
    parseUrl: (url: string) => ReturnType<DefaultUrlSerializer['parse']>;
  };

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
    const serializer = new DefaultUrlSerializer();
    router = {
      url: '/login',
      navigate: vi.fn().mockResolvedValue(true),
      navigateByUrl: vi.fn().mockResolvedValue(true),
      parseUrl: (url: string) => serializer.parse(url),
    };

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
    actions$ = of(
      AuthActions.login({ request: { email: 'asha@example.com', password: 'secret' } }),
    );

    expect(collect(effects.login$)).toEqual([AuthActions.loginSuccess({ auth })]);
    expect(tokenStorage['storeTokens']).toHaveBeenCalledWith('access', 'refresh');
  });

  it('emits loginFailure with the server message when login fails', () => {
    authService['login'].mockReturnValue(
      throwError(() => ({ error: { message: 'Invalid credentials' } })),
    );
    actions$ = of(AuthActions.login({ request: { email: 'x@example.com', password: 'bad' } }));

    expect(collect(effects.login$)).toEqual([
      AuthActions.loginFailure({ error: 'Invalid credentials' }),
    ]);
    expect(tokenStorage['storeTokens']).not.toHaveBeenCalled();
  });

  it('joins validation messages when register fails', () => {
    authService['register'].mockReturnValue(
      throwError(() => ({ error: { messages: ['Email taken', 'Weak password'] } })),
    );
    actions$ = of(
      AuthActions.register({ request: { fullName: 'A', email: 'a@b.com', password: 'x' } }),
    );

    expect(collect(effects.register$)).toEqual([
      AuthActions.registerFailure({ error: 'Email taken. Weak password' }),
    ]);
  });

  it('returns a customer to the page in returnUrl after login', () => {
    router.url = '/login?returnUrl=%2Fcustomer%2Fpolicies%2Fnew%3FproductId%3D1';
    actions$ = of(AuthActions.loginSuccess({ auth }));

    collect(effects.redirectAfterLogin$ as Observable<Action>);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/customer/policies/new?productId=1');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('ignores returnUrl for staff and for paths outside /customer', () => {
    router.url = '/login?returnUrl=%2Fcustomer%2Fpolicies%2Fnew';
    actions$ = of(
      AuthActions.loginSuccess({ auth: { ...auth, user: { ...auth.user, role: 'ROLE_ADMIN' } } }),
    );
    collect(effects.redirectAfterLogin$ as Observable<Action>);
    expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);

    router.url = '/login?returnUrl=https%3A%2F%2Fevil.example';
    actions$ = of(AuthActions.loginSuccess({ auth }));
    collect(effects.redirectAfterLogin$ as Observable<Action>);
    expect(router.navigate).toHaveBeenCalledWith(['/customer/dashboard']);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
