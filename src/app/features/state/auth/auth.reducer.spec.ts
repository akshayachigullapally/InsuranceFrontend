import { authReducer } from './auth.reducer';
import { AuthState, initialAuthState } from './auth.state';
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

  it('sets loading and clears the error when login starts', () => {
    const state = authReducer(
      { ...initialAuthState, error: 'old error' },
      AuthActions.login({ request: { email: 'a@b.com', password: 'x' } }),
    );

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
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

  it('stores the error on login failure', () => {
    const state = authReducer(
      { ...initialAuthState, isLoading: true },
      AuthActions.loginFailure({ error: 'Invalid credentials' }),
    );

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Invalid credentials');
    expect(state.sessionRestored).toBe(true);
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

  it('resets to the initial state when refreshing the token fails', () => {
    const loggedIn = authReducer(initialAuthState, AuthActions.loginSuccess({ auth: makeAuth() }));

    const state = authReducer(loggedIn, AuthActions.refreshTokenFailure({ error: 'Expired' }));

    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.error).toBe('Expired');
  });

  it('clears everything on logout success but keeps sessionRestored', () => {
    const loggedIn = authReducer(initialAuthState, AuthActions.loginSuccess({ auth: makeAuth() }));

    const state = authReducer(loggedIn, AuthActions.logoutSuccess());

    expect(state).toEqual({ ...initialAuthState, sessionRestored: true });
  });

  it('clears only the error on clearAuthError', () => {
    const current: AuthState = { ...initialAuthState, error: 'Oops', isAuthenticated: true };

    const state = authReducer(current, AuthActions.clearAuthError());

    expect(state.error).toBeNull();
    expect(state.isAuthenticated).toBe(true);
  });
});
