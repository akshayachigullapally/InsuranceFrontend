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
    { label: 'Claims', routerLink: '/customer/claims' },
    { label: 'Payments', routerLink: '/customer/payments' },
    { label: 'Payouts', routerLink: '/customer/payouts' },
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
  ],
};

export const ROLE_MORE_MENU: Record<string, HeaderMoreGroup[]> = {
  [ROLES.CUSTOMER]: [
    {
      label: 'Account',
      items: [
        // { label: 'My Profile', routerLink: '/customer/profile', icon: '👤' },
        { label: 'New Policy', routerLink: '/customer/policies/new', icon: '➕' },
        { label: 'Get a Quote', routerLink: '/customer/quotes', icon: '💬' },
        { label: 'New Claim', routerLink: '/customer/claims/new', icon: '📋' },
        { label: 'Notifications', routerLink: '/customer/notifications', icon: '🔔' },
        { label: 'My Activity', routerLink: '/customer/activity', icon: '🕘' },
      ],
    },
  ],
  [ROLES.UNDERWRITER]: [
    {
      label: 'Account',
      items: [
        { label: 'Notifications', routerLink: '/underwriter/notifications', icon: '🔔' },
        { label: 'My Activity', routerLink: '/underwriter/activity', icon: '🕘' },
      ],
    },
  ],
  [ROLES.CLAIMS_OFFICER]: [
    {
      label: 'Account',
      items: [
        { label: 'Notifications', routerLink: '/claims-officer/notifications', icon: '🔔' },
        { label: 'My Activity', routerLink: '/claims-officer/activity', icon: '🕘' },
      ],
    },
  ],
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
        { label: 'Audit Log (all users)', routerLink: '/admin/audit', icon: '📝' },
        { label: 'My Activity', routerLink: '/admin/activity', icon: '🕘' },
      ],
    },
  ],
};
