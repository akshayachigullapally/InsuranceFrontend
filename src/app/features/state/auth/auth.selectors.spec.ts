import { AuthState, initialAuthState } from './auth.state';
import {
  selectAuthCustomerId,
  selectAuthError,
  selectAuthLoading,
  selectAuthRole,
  selectAuthUser,
  selectIsAuthenticated,
  selectSessionRestored,
} from './auth.selectors';

describe('auth selectors', () => {
  const auth: AuthState = {
    ...initialAuthState,
    user: { id: 1, fullName: 'Asha', email: 'asha@example.com', role: 'ROLE_CUSTOMER', customerId: 7 },
    isAuthenticated: true,
    isLoading: true,
    error: 'Some error',
    role: 'ROLE_CUSTOMER',
    sessionRestored: true,
  };
  const rootState = { auth };

  it('selects the user and customerId', () => {
    expect(selectAuthUser(rootState)?.fullName).toBe('Asha');
    expect(selectAuthCustomerId(rootState)).toBe(7);
  });

  it('selects the auth flags', () => {
    expect(selectIsAuthenticated(rootState)).toBe(true);
    expect(selectAuthLoading(rootState)).toBe(true);
    expect(selectSessionRestored(rootState)).toBe(true);
  });

  it('selects role and error', () => {
    expect(selectAuthRole(rootState)).toBe('ROLE_CUSTOMER');
    expect(selectAuthError(rootState)).toBe('Some error');
  });

  it('returns undefined customerId when there is no user', () => {
    expect(selectAuthCustomerId({ auth: initialAuthState })).toBeUndefined();
  });
});
