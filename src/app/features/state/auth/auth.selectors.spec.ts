import { AuthState, initialAuthState } from './auth.state';
import {
  selectAccessToken,
  selectAuthCustomerId,
  selectAuthError,
  selectAuthLoading,
  selectAuthRole,
  selectAuthUser,
  selectIsAuthenticated,
  selectRefreshToken,
  selectSessionRestored,
} from './auth.selectors';

describe('auth selectors', () => {
  const auth: AuthState = {
    ...initialAuthState,
    user: { id: 1, fullName: 'Asha', email: 'asha@example.com', role: 'ROLE_CUSTOMER', customerId: 7 },
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    isAuthenticated: true,
    isLoading: true,
    error: 'Some error',
    role: 'ROLE_CUSTOMER',
    sessionRestored: true,
  };

  it('selects the user and customerId', () => {
    expect(selectAuthUser.projector(auth)?.fullName).toBe('Asha');
    expect(selectAuthCustomerId.projector(auth)).toBe(7);
  });

  it('selects the tokens', () => {
    expect(selectAccessToken.projector(auth)).toBe('access-token');
    expect(selectRefreshToken.projector(auth)).toBe('refresh-token');
  });

  it('selects the auth flags', () => {
    expect(selectIsAuthenticated.projector(auth)).toBe(true);
    expect(selectAuthLoading.projector(auth)).toBe(true);
    expect(selectSessionRestored.projector(auth)).toBe(true);
  });

  it('selects role and error', () => {
    expect(selectAuthRole.projector(auth)).toBe('ROLE_CUSTOMER');
    expect(selectAuthError.projector(auth)).toBe('Some error');
  });

  it('returns defaults for the initial state', () => {
    expect(selectAuthUser.projector(initialAuthState)).toBeNull();
    expect(selectAuthCustomerId.projector(initialAuthState)).toBeUndefined();
    expect(selectIsAuthenticated.projector(initialAuthState)).toBe(false);
  });
});
