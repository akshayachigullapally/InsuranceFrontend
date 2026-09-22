import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';
import { ROLES } from './core/constants/roles';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { CustomerLayoutComponent } from './layouts/customer-layout/customer-layout.component';
import { UnderwriterLayoutComponent } from './layouts/underwriter-layout/underwriter-layout.component';
import { ClaimsOfficerLayoutComponent } from './layouts/claims-officer-layout/claims-officer-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/components/welcome/welcome.component').then((m) => m.WelcomeComponent),
      },
      {
        path: 'welcome',
        redirectTo: '',
        pathMatch: 'full',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/components/public-product-list/public-product-list.component').then(
            (m) => m.PublicProductListComponent,
          ),
      },
      {
        path: 'products/:productId',
        loadComponent: () =>
          import('./features/components/public-product-detail/public-product-detail.component').then(
            (m) => m.PublicProductDetailComponent,
          ),
      },
    ],
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/components/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/components/register/register.component').then((m) => m.RegisterComponent),
      },
    ],
  },
  {
    path: 'customer',
    component: CustomerLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [ROLES.CUSTOMER] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/components/customer-dashboard/customer-dashboard.component').then(
            (m) => m.CustomerDashboardComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/components/customer-profile/customer-profile.component').then(
            (m) => m.CustomerProfileComponent,
          ),
      },
      {
        path: 'policies',
        loadComponent: () =>
          import('./features/components/customer-policies/customer-policies.component').then(
            (m) => m.CustomerPoliciesComponent,
          ),
      },
      {
        path: 'policies/new',
        loadComponent: () =>
          import('./features/components/customer-policy-new/customer-policy-new.component').then(
            (m) => m.CustomerPolicyNewComponent,
          ),
      },
      {
        path: 'policies/:policyId',
        loadComponent: () =>
          import('./features/components/customer-policy-detail/customer-policy-detail.component').then(
            (m) => m.CustomerPolicyDetailComponent,
          ),
      },
      {
        path: 'claims',
        loadComponent: () =>
          import('./features/components/customer-claims/customer-claims.component').then(
            (m) => m.CustomerClaimsComponent,
          ),
      },
      {
        path: 'claims/new',
        loadComponent: () =>
          import('./features/components/customer-claim-new/customer-claim-new.component').then(
            (m) => m.CustomerClaimNewComponent,
          ),
      },
      {
        path: 'claims/:claimId',
        loadComponent: () =>
          import('./features/components/customer-claim-detail/customer-claim-detail.component').then(
            (m) => m.CustomerClaimDetailComponent,
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/components/customer-notifications/customer-notifications.component').then(
            (m) => m.CustomerNotificationsComponent,
          ),
      },
    ],
  },
  {
    path: 'underwriter',
    component: UnderwriterLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [ROLES.UNDERWRITER] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/components/underwriter-dashboard/underwriter-dashboard.component').then(
            (m) => m.UnderwriterDashboardComponent,
          ),
      },
      {
        path: 'policies',
        loadComponent: () =>
          import('./features/components/underwriter-policies/underwriter-policies.component').then(
            (m) => m.UnderwriterPoliciesComponent,
          ),
      },
      {
        path: 'policies/:policyId',
        loadComponent: () =>
          import('./features/components/underwriter-policy-detail/underwriter-policy-detail.component').then(
            (m) => m.UnderwriterPolicyDetailComponent,
          ),
      },
    ],
  },
  {
    path: 'claims-officer',
    component: ClaimsOfficerLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [ROLES.CLAIMS_OFFICER] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/components/claims-officer-dashboard/claims-officer-dashboard.component').then(
            (m) => m.ClaimsOfficerDashboardComponent,
          ),
      },
      {
        path: 'claims',
        loadComponent: () =>
          import('./features/components/claims-officer-claims/claims-officer-claims.component').then(
            (m) => m.ClaimsOfficerClaimsComponent,
          ),
      },
      {
        path: 'claims/:claimId',
        loadComponent: () =>
          import('./features/components/claims-officer-claim-detail/claims-officer-claim-detail.component').then(
            (m) => m.ClaimsOfficerClaimDetailComponent,
          ),
      },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [ROLES.ADMIN] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/components/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/components/admin-products/admin-products.component').then(
            (m) => m.AdminProductsComponent,
          ),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./features/components/admin-product-new/admin-product-new.component').then(
            (m) => m.AdminProductNewComponent,
          ),
      },
      {
        path: 'products/:productId',
        loadComponent: () =>
          import('./features/components/admin-product-edit/admin-product-edit.component').then(
            (m) => m.AdminProductEditComponent,
          ),
      },
      {
        path: 'product-thresholds',
        loadComponent: () =>
          import('./features/components/admin-product-thresholds/admin-product-thresholds.component').then(
            (m) => m.AdminProductThresholdsComponent,
          ),
      },
      {
        path: 'products/:productId/threshold',
        loadComponent: () =>
          import('./features/components/admin-product-threshold/admin-product-threshold.component').then(
            (m) => m.AdminProductThresholdComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/components/admin-users/admin-users.component').then(
            (m) => m.AdminUsersComponent,
          ),
      },
      {
        path: 'policies',
        loadComponent: () =>
          import('./features/components/admin-policies/admin-policies.component').then(
            (m) => m.AdminPoliciesComponent,
          ),
      },
      {
        path: 'policies/:policyId',
        loadComponent: () =>
          import('./features/components/admin-policy-detail/admin-policy-detail.component').then(
            (m) => m.AdminPolicyDetailComponent,
          ),
      },
      {
        path: 'claims',
        loadComponent: () =>
          import('./features/components/admin-claims/admin-claims.component').then(
            (m) => m.AdminClaimsComponent,
          ),
      },
      {
        path: 'claims/:claimId',
        loadComponent: () =>
          import('./features/components/admin-claim-detail/admin-claim-detail.component').then(
            (m) => m.AdminClaimDetailComponent,
          ),
      },
      {
        path: 'perils',
        loadComponent: () =>
          import('./features/components/admin-perils/admin-perils.component').then(
            (m) => m.AdminPerilsComponent,
          ),
      },
      {
        path: 'zones',
        loadComponent: () =>
          import('./features/components/admin-zones/admin-zones.component').then(
            (m) => m.AdminZonesComponent,
          ),
      },
      {
        path: 'current-measurements',
        loadComponent: () =>
          import('./features/components/admin-current-measurements/admin-current-measurements.component').then(
            (m) => m.AdminCurrentMeasurementsComponent,
          ),
      },
      {
        path: 'trigger-events',
        loadComponent: () =>
          import('./features/components/admin-trigger-events/admin-trigger-events.component').then(
            (m) => m.AdminTriggerEventsComponent,
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/components/admin-notifications/admin-notifications.component').then(
            (m) => m.AdminNotificationsComponent,
          ),
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('./features/components/admin-audit/admin-audit.component').then(
            (m) => m.AdminAuditComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];