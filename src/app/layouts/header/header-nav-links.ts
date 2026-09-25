import { ROLES } from '../../core/constants/roles';

export interface HeaderNavLink {
  label: string;
  routerLink: string;
  icon?: string;
}

export interface HeaderMoreGroup {
  label: string;
  items: HeaderNavLink[];
}

export const ROLE_PRIMARY_NAV: Record<string, HeaderNavLink[]> = {
  [ROLES.CUSTOMER]: [
    { label: 'Dashboard', routerLink: '/customer/dashboard' },
    { label: 'Policies', routerLink: '/customer/policies' },
    { label: 'Quotes', routerLink: '/customer/quotes' },
    { label: 'Payments', routerLink: '/customer/payments' },
    { label: 'Claims', routerLink: '/customer/claims' },
  ],
  [ROLES.UNDERWRITER]: [
    { label: 'Dashboard', routerLink: '/underwriter/dashboard' },
    { label: 'Policies', routerLink: '/underwriter/policies' },
  ],
  [ROLES.CLAIMS_OFFICER]: [
    { label: 'Dashboard', routerLink: '/claims-officer/dashboard' },
    { label: 'Claims', routerLink: '/claims-officer/claims' },
  ],
  [ROLES.ADMIN]: [
    // { label: 'Dashboard', routerLink: '/admin/dashboard' },
    { label: 'Products', routerLink: '/admin/products' },
    { label: 'Users', routerLink: '/admin/users' },
    { label: 'Policies', routerLink: '/admin/policies' },
    { label: 'Claims', routerLink: '/admin/claims' },
    { label: 'Measurements', routerLink: '/admin/current-measurements', },
  ],
};

export const ROLE_MORE_MENU: Record<string, HeaderMoreGroup[]> = {
  [ROLES.CUSTOMER]: [
    {
      label: 'Account',
      items: [
        // { label: 'My Profile', routerLink: '/customer/profile', icon: '👤' },
        { label: 'New Policy', routerLink: '/customer/policies/new', icon: '➕' },
        { label: 'New Claim', routerLink: '/customer/claims/new', icon: '📋' },
        { label: 'Notifications', routerLink: '/customer/notifications', icon: '🔔' },
      ],
    },
  ],
  [ROLES.UNDERWRITER]: [],
  [ROLES.CLAIMS_OFFICER]: [],
  [ROLES.ADMIN]: [
    {
      label: 'Reference Data',
      items: [
        { label: 'Perils', routerLink: '/admin/perils', icon: '⚡' },
        { label: 'Zones', routerLink: '/admin/zones', icon: '📍' },
      ],
    },
    {
      label: 'Finance',
      items: [
        { label: 'Pricing Rules', routerLink: '/admin/pricing-rules', icon: '⚙️' },
        { label: 'Payments', routerLink: '/admin/payments', icon: '💳' },
        { label: 'Payouts', routerLink: '/admin/payouts', icon: '🏦' },
      ],
    },
    {
      label: 'Operations',
      items: [
        { label: 'Trigger Events', routerLink: '/admin/trigger-events', icon: '🚨' },
        { label: 'Notifications', routerLink: '/admin/notifications', icon: '🔔' },
        { label: 'Audit Log', routerLink: '/admin/audit', icon: '📝' },
      ],
    },
  ],
};
