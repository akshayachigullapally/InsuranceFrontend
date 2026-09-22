import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { authReducer } from './features/state/auth/auth.reducer';
import { AuthEffects } from './features/state/auth/auth.effects';
import { productsReducer } from './features/state/products/products.reducer';
import { ProductsEffects } from './features/state/products/products.effects';
import { policiesReducer } from './features/state/policies/policies.reducer';
import { PoliciesEffects } from './features/state/policies/policies.effects';
import { usersReducer } from './features/state/users/users.reducers';
import { UsersEffects } from './features/state/users/users.effects';
import { claimsReducer } from './features/state/claims/claims.reducer';
import { ClaimsEffects } from './features/state/claims/claims.effects';
import { zonesReducer } from './features/state/zones/zones.reducer';
import { ZonesEffects } from './features/state/zones/zones.effects';
import { perilsReducer } from './features/state/perils/perils.reducer';
import { PerilsEffects } from './features/state/perils/perils.effects';
import { triggerEventsReducer } from './features/state/trigger-events/trigger-events.reducer';
import { TriggerEventsEffects } from './features/state/trigger-events/trigger-events.effects';
import { notificationsReducer } from './features/state/notifications/notifications.reducer';
import { NotificationsEffects } from './features/state/notifications/notifications.effects';
import { quotesReducer } from './features/state/quotes/quotes.reducer';
import { QuotesEffects } from './features/state/quotes/quotes.effects';
import { paymentsReducer } from './features/state/payments/payments.reducer';
import { PaymentsEffects } from './features/state/payments/payments.effects';
import { payoutsReducer } from './features/state/payouts/payouts.reducer';
import { PayoutsEffects } from './features/state/payouts/payouts.effects';
import { pricingRulesReducer } from './features/state/pricing-rules/pricing-rules.reducer';
import { PricingRulesEffects } from './features/state/pricing-rules/pricing-rules.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideStore({
      auth: authReducer,
      products: productsReducer,
      policies: policiesReducer,
      users: usersReducer,
      claims: claimsReducer,
      zones: zonesReducer,
      perils: perilsReducer,
      triggerEvents: triggerEventsReducer,
      notifications: notificationsReducer,
      quotes: quotesReducer,
      payments: paymentsReducer,
      payouts: payoutsReducer,
      pricingRules: pricingRulesReducer,
    }),
    provideEffects([
      AuthEffects,
      ProductsEffects,
      PoliciesEffects,
      UsersEffects,
      ClaimsEffects,
      ZonesEffects,
      PerilsEffects,
      TriggerEventsEffects,
      NotificationsEffects,
      QuotesEffects,
      PaymentsEffects,
      PayoutsEffects,
      PricingRulesEffects,
    ]),
    ...(environment.production
      ? []
      : [
          provideStoreDevtools({
            maxAge: 25,
            logOnly: false,
          }),
        ]),
  ],
};