import { EnvironmentProviders, Provider } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Routes } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { AuthState, initialAuthState } from '../app/features/state/auth/auth.state';
import { initialClaimsState } from '../app/features/state/claims/claims.state';
import { initialNotificationsState } from '../app/features/state/notifications/notifications.state';
import { initialPaymentsState } from '../app/features/state/payments/payments.state';
import { initialPayoutsState } from '../app/features/state/payouts/payouts.state';
import { initialPerilsState } from '../app/features/state/perils/perils.state';
import { initialPoliciesState } from '../app/features/state/policies/policies.state';
import { initialPricingRulesState } from '../app/features/state/pricing-rules/pricing-rules.state';
import { initialProductsState } from '../app/features/state/products/products.state';
import { initialQuotesState } from '../app/features/state/quotes/quotes.state';
import { initialTriggerEventsState } from '../app/features/state/trigger-events/trigger-events.state';
import { initialUsersState } from '../app/features/state/users/users.state';
import { initialZonesState } from '../app/features/state/zones/zones.state';

/** Root store state built from every feature's real initial state. */
export function mockRootState(overrides: Record<string, unknown> = {}) {
  return {
    auth: initialAuthState,
    claims: initialClaimsState,
    notifications: initialNotificationsState,
    payments: initialPaymentsState,
    payouts: initialPayoutsState,
    perils: initialPerilsState,
    policies: initialPoliciesState,
    pricingRules: initialPricingRulesState,
    products: initialProductsState,
    quotes: initialQuotesState,
    triggerEvents: initialTriggerEventsState,
    users: initialUsersState,
    zones: initialZonesState,
    ...overrides,
  };
}

/** Auth state for a signed-in user with the given role. */
export function loggedInAuth(role = 'ROLE_CUSTOMER'): AuthState {
  return {
    ...initialAuthState,
    user: { id: 1, fullName: 'Asha Rao', email: 'asha@example.com', role, customerId: 7 },
    isAuthenticated: true,
    role,
    sessionRestored: true,
  };
}

/**
 * Providers most page components need: a mock store seeded with real initial
 * state, the router, and an HttpClient backed by HttpTestingController.
 */
export function pageTestProviders(
  stateOverrides: Record<string, unknown> = {},
  routes: Routes = [],
): (Provider | EnvironmentProviders)[] {
  return [
    provideRouter(routes),
    provideHttpClient(),
    provideHttpClientTesting(),
    provideMockStore({ initialState: mockRootState(stateOverrides) }),
  ];
}
