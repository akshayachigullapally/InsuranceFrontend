import { authReducer } from './auth.reducer';
import { initialAuthState } from './auth.state';
import * as AuthActions from './auth.actions';
import { AuthResponse } from '../../dtos/auth/auth-response.dto';

function base64Url(value: object): string {
  return btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function makeToken(payload: object): string {
  return `${base64Url({ alg: 'HS256' })}.${base64Url(payload)}.sig`;
}

function makeAuth(overrides: Partial<AuthResponse> = {}): AuthResponse {
  return {
    accessToken: makeToken({ sub: '1', email: 'token@example.com', role: 'ROLE_CUSTOMER', customerId: 7 }),
    refreshToken: 'refresh',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: { id: 1, fullName: 'Asha Rao', email: 'asha@example.com', role: 'ROLE_CUSTOMER' },
    ...overrides,
  };
}

describe('authReducer', () => {
  it('returns the initial state for an unknown action', () => {
    expect(authReducer(undefined, { type: '[Unknown]' } as never)).toEqual(initialAuthState);
  });

  it('stores the user, tokens and customerId from the token on login success', () => {
    const auth = makeAuth();

    const state = authReducer(initialAuthState, AuthActions.loginSuccess({ auth }));

    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.accessToken).toBe(auth.accessToken);
    expect(state.refreshToken).toBe('refresh');
    expect(state.role).toBe('ROLE_CUSTOMER');
    expect(state.user).toEqual({
      id: 1,
      fullName: 'Asha Rao',
      email: 'token@example.com',
      role: 'ROLE_CUSTOMER',
      customerId: 7,
    });
  });

  it('maps the legacy claims reviewer role to claims officer', () => {
    const auth = makeAuth({
      accessToken: 'not-a-jwt',
      user: { id: 2, fullName: 'Ravi', email: 'ravi@example.com', role: 'ROLE_CLAIMS_REVIEWER' },
    });

    const state = authReducer(initialAuthState, AuthActions.registerSuccess({ auth }));

    expect(state.role).toBe('ROLE_CLAIMS_OFFICER');
    expect(state.user?.email).toBe('ravi@example.com');
  });

  it('marks the session as restored on restore success', () => {
    const state = authReducer(
      initialAuthState,
      AuthActions.restoreSessionSuccess({
        user: { id: 1, fullName: 'Asha', email: 'asha@example.com', role: 'ROLE_ADMIN' },
        customerId: undefined,
      }),
    );

    expect(state.isAuthenticated).toBe(true);
    expect(state.sessionRestored).toBe(true);
    expect(state.role).toBe('ROLE_ADMIN');
  });
});
