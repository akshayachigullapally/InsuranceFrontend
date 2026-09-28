import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectAuthUser = createSelector(selectAuthState, (state: AuthState) => state.user);
export const selectAccessToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.accessToken,
);
export const selectRefreshToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.refreshToken,
);
export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthenticated,
);
export const selectAuthLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.isLoading,
);
export const selectAuthError = createSelector(selectAuthState, (state: AuthState) => state.error);
export const selectAuthRole = createSelector(selectAuthState, (state: AuthState) => state.role);
export const selectSessionRestored = createSelector(
  selectAuthState,
  (state: AuthState) => state.sessionRestored,
);
export const selectAuthCustomerId = createSelector(
  selectAuthState,
  (state: AuthState) => state.user?.customerId,
);
