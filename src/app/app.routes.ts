import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';
import { ROLES } from './core/constants/roles';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        title: 'Weather cover that pays itself',
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
        title: 'Products',
        loadComponent: () =>
          import('./features/components/public-product-list/public-product-list.component').then(
            (m) => m.PublicProductListComponent,
          ),
      },
      {
        path: 'products/:productId',
        title: 'Product details',
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
        title: 'Sign in',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/components/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        title: 'Create account',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/components/register/register.component').then((m) => m.RegisterComponent),
      },
    ],
  },
  {
    path: 'customer',
    component: AppLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [ROLES.CUSTOMER] },
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard',
        loadComponent: () =>
          import('./features/components/customer-dashboard/customer-dashboard.component').then(
            (m) => m.CustomerDashboardComponent,
          ),
      },
      {
        path: 'profile',
        title: 'My profile',
        loadComponent: () =>
          import('./features/components/customer-profile/customer-profile.component').then(
            (m) => m.CustomerProfileComponent,
          ),
      },
      {
        path: 'policies',
        title: 'My policies',
        loadComponent: () =>
          import('./features/components/customer-policies/customer-policies.component').then(
            (m) => m.CustomerPoliciesComponent,
          ),
      },
      {
        path: 'policies/new',
        title: 'Buy a policy',
        loadComponent: () =>
          import('./features/components/customer-policy-new/customer-policy-new.component').then(
            (m) => m.CustomerPolicyNewComponent,
          ),
      },
      {
        path: 'policies/:policyId',
        title: 'Policy details',
        loadComponent: () =>
          import('./features/components/customer-policy-detail/customer-policy-detail.component').then(
            (m) => m.CustomerPolicyDetailComponent,
          ),
      },
      {
        path: 'claims',
        title: 'My claims',
        loadComponent: () =>
          import('./features/components/customer-claims/customer-claims.component').then(
            (m) => m.CustomerClaimsComponent,
          ),
      },
      {
        path: 'claims/new',
        title: 'Raise a claim',
        loadComponent: () =>
          import('./features/components/customer-claim-new/customer-claim-new.component').then(
            (m) => m.CustomerClaimNewComponent,
          ),
      },
      {
        path: 'claims/:claimId',
        title: 'Claim details',
        loadComponent: () =>
          import('./features/components/customer-claim-detail/customer-claim-detail.component').then(
            (m) => m.CustomerClaimDetailComponent,
          ),
      },
      {
        path: 'notifications',
        title: 'Notifications',
        loadComponent: () =>
          import('./features/components/customer-notifications/customer-notifications.component').then(
            (m) => m.CustomerNotificationsComponent,
          ),
      },
      {
        path: 'quotes',
        title: 'Quotes',
        loadComponent: () =>
          import('./features/components/customer-quotes/customer-quotes.component').then(
            (m) => m.CustomerQuotesComponent,
          ),
      },
      {
        path: 'payments',
        title: 'Payments',
        loadComponent: () =>
          import('./features/components/customer-payments/customer-payments.component').then(
            (m) => m.CustomerPaymentsComponent,
          ),
      },
      {
        path: 'zone-map',
        title: 'Zone map',
        data: { audience: 'customer' },
        loadComponent: () =>
          import('./features/components/zone-map-page/zone-map-page.component').then(
            (m) => m.ZoneMapPageComponent,
          ),
      },
      {
        // Payouts are shown as a tab on the Payments page.
        path: 'payouts',
        pathMatch: 'full',
        redirectTo: '/customer/payments?tab=payouts',
      },
      {
        path: 'activity',
        title: 'Activity',
        data: { auditScope: 'MINE' },
        loadComponent: () =>
          import('./features/components/audit-history/audit-history.component').then(
            (m) => m.AuditHistoryComponent,
          ),
      },
    ],
  },
  {
    path: 'underwriter',
    component: AppLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [ROLES.UNDERWRITER] },
    children: [
      {
        path: 'dashboard',
        title: 'Underwriting dashboard',
        loadComponent: () =>
          import('./features/components/underwriter-dashboard/underwriter-dashboard.component').then(
            (m) => m.UnderwriterDashboardComponent,
          ),
      },
      {
        path: 'policies',
        title: 'Policies to review',
        loadComponent: () =>
          import('./features/components/underwriter-policies/underwriter-policies.component').then(
            (m) => m.UnderwriterPoliciesComponent,
          ),
      },
      {
        path: 'policies/:policyId',
        title: 'Policy review',
        loadComponent: () =>
          import('./features/components/underwriter-policy-detail/underwriter-policy-detail.component').then(
            (m) => m.UnderwriterPolicyDetailComponent,
          ),
      },
      {
        path: 'notifications',
        title: 'Notifications',
        loadComponent: () =>
          import('./features/components/staff-notifications/staff-notifications.component').then(
            (m) => m.StaffNotificationsComponent,
          ),
      },
      {
        path: 'activity',
        title: 'Activity',
        data: { auditScope: 'MINE' },
        loadComponent: () =>
          import('./features/components/audit-history/audit-history.component').then(
            (m) => m.AuditHistoryComponent,
          ),
      },
      {
        path: 'history',
        title: 'Review history',
        loadComponent: () =>
          import('./features/components/underwriter-review-history/underwriter-review-history.component').then(
            (m) => m.UnderwriterReviewHistoryComponent,
          ),
      },
    ],
  },
  {
    path: 'claims-officer',
    component: AppLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [ROLES.CLAIMS_OFFICER] },
    children: [
      {
        path: 'dashboard',
        title: 'Claims dashboard',
        loadComponent: () =>
          import('./features/components/claims-officer-dashboard/claims-officer-dashboard.component').then(
            (m) => m.ClaimsOfficerDashboardComponent,
          ),
      },
      {
        path: 'claims',
        title: 'Claims queue',
        loadComponent: () =>
          import('./features/components/claims-officer-claims/claims-officer-claims.component').then(
            (m) => m.ClaimsOfficerClaimsComponent,
          ),
      },
      {
        path: 'claims/:claimId',
        title: 'Claim review',
        loadComponent: () =>
          import('./features/components/claims-officer-claim-detail/claims-officer-claim-detail.component').then(
            (m) => m.ClaimsOfficerClaimDetailComponent,
          ),
      },
      {
        path: 'notifications',
        title: 'Notifications',
        loadComponent: () =>
          import('./features/components/staff-notifications/staff-notifications.component').then(
            (m) => m.StaffNotificationsComponent,
          ),
      },
      {
        path: 'activity',
        title: 'Activity',
        data: { auditScope: 'MINE' },
        loadComponent: () =>
          import('./features/components/audit-history/audit-history.component').then(
            (m) => m.AuditHistoryComponent,
          ),
      },
      {
        path: 'history',
        title: 'Review history',
        loadComponent: () =>
          import('./features/components/claims-officer-review-history/claims-officer-review-history.component').then(
            (m) => m.ClaimsOfficerReviewHistoryComponent,
          ),
      },
    ],
  },
  {
    path: 'admin',
    component: AppLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [ROLES.ADMIN] },
    children: [
      {
        path: 'dashboard',
        title: 'Admin dashboard',
        loadComponent: () =>
          import('./features/components/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'products',
        title: 'Products',
        loadComponent: () =>
          import('./features/components/admin-products/admin-products.component').then(
            (m) => m.AdminProductsComponent,
          ),
      },
      {
        path: 'products/new',
        title: 'New product',
        loadComponent: () =>
          import('./features/components/admin-product-new/admin-product-new.component').then(
            (m) => m.AdminProductNewComponent,
          ),
      },
      {
        path: 'products/:productId',
        title: 'Product details',
        loadComponent: () =>
          import('./features/components/admin-product-edit/admin-product-edit.component').then(
            (m) => m.AdminProductEditComponent,
          ),
      },
      {
        path: 'product-thresholds',
        title: 'Product thresholds',
        loadComponent: () =>
          import('./features/components/admin-product-thresholds/admin-product-thresholds.component').then(
            (m) => m.AdminProductThresholdsComponent,
          ),
      },
      {
        path: 'products/:productId/threshold',
        title: 'Edit threshold',
        loadComponent: () =>
          import('./features/components/admin-product-threshold/admin-product-threshold.component').then(
            (m) => m.AdminProductThresholdComponent,
          ),
      },
      {
        path: 'users',
        title: 'Users',
        loadComponent: () =>
          import('./features/components/admin-users/admin-users.component').then(
            (m) => m.AdminUsersComponent,
          ),
      },
      {
        path: 'users/:userId',
        title: 'User details',
        loadComponent: () =>
          import('./features/components/admin-user-detail/admin-user-detail.component').then(
            (m) => m.AdminUserDetailComponent,
          ),
      },
      {
        path: 'policies',
        title: 'Policies',
        loadComponent: () =>
          import('./features/components/admin-policies/admin-policies.component').then(
            (m) => m.AdminPoliciesComponent,
          ),
      },
      {
        path: 'policies/:policyId',
        title: 'Policy details',
        loadComponent: () =>
          import('./features/components/admin-policy-detail/admin-policy-detail.component').then(
            (m) => m.AdminPolicyDetailComponent,
          ),
      },
      {
        path: 'claims',
        title: 'Claims',
        loadComponent: () =>
          import('./features/components/admin-claims/admin-claims.component').then(
            (m) => m.AdminClaimsComponent,
          ),
      },
      {
        path: 'claims/:claimId',
        title: 'Claim details',
        loadComponent: () =>
          import('./features/components/admin-claim-detail/admin-claim-detail.component').then(
            (m) => m.AdminClaimDetailComponent,
          ),
      },
      {
        path: 'perils',
        title: 'Perils',
        loadComponent: () =>
          import('./features/components/admin-perils/admin-perils.component').then(
            (m) => m.AdminPerilsComponent,
          ),
      },
      {
        path: 'zones',
        title: 'Zones',
        loadComponent: () =>
          import('./features/components/admin-zones/admin-zones.component').then(
            (m) => m.AdminZonesComponent,
          ),
      },
      {
        path: 'zone-exposure',
        title: 'Zone exposure',
        loadComponent: () =>
          import('./features/components/admin-zone-exposure/admin-zone-exposure.component').then(
            (m) => m.AdminZoneExposureComponent,
          ),
      },
      {
        path: 'current-measurements',
        title: 'Trigger simulator',
        loadComponent: () =>
          import('./features/components/admin-current-measurements/admin-current-measurements.component').then(
            (m) => m.AdminCurrentMeasurementsComponent,
          ),
      },
      {
        path: 'pricing-rules',
        title: 'Pricing rules',
        loadComponent: () =>
          import('./features/components/admin-pricing-rules/admin-pricing-rules.component').then(
            (m) => m.AdminPricingRulesComponent,
          ),
      },
      {
        path: 'payments',
        title: 'Payments',
        loadComponent: () =>
          import('./features/components/admin-payments/admin-payments.component').then(
            (m) => m.AdminPaymentsComponent,
          ),
      },
      {
        path: 'payouts',
        title: 'Payouts',
        loadComponent: () =>
          import('./features/components/admin-payouts/admin-payouts.component').then(
            (m) => m.AdminPayoutsComponent,
          ),
      },
      {
        path: 'trigger-events',
        title: 'Trigger events',
        loadComponent: () =>
          import('./features/components/admin-trigger-events/admin-trigger-events.component').then(
            (m) => m.AdminTriggerEventsComponent,
          ),
      },
      {
        path: 'zone-map',
        title: 'Zone map',
        data: { audience: 'admin' },
        loadComponent: () =>
          import('./features/components/zone-map-page/zone-map-page.component').then(
            (m) => m.ZoneMapPageComponent,
          ),
      },
      {
        path: 'notifications',
        title: 'Notifications',
        loadComponent: () =>
          import('./features/components/admin-notifications/admin-notifications.component').then(
            (m) => m.AdminNotificationsComponent,
          ),
      },
      {
        path: 'audit',
        title: 'Audit log',
        data: { auditScope: 'ALL' },
        loadComponent: () =>
          import('./features/components/audit-history/audit-history.component').then(
            (m) => m.AuditHistoryComponent,
          ),
      },
      {
        path: 'activity',
        title: 'Activity',
        data: { auditScope: 'MINE' },
        loadComponent: () =>
          import('./features/components/audit-history/audit-history.component').then(
            (m) => m.AuditHistoryComponent,
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