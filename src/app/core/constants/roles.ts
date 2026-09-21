export const ROLES = {
  CUSTOMER: 'ROLE_CUSTOMER',
  UNDERWRITER: 'ROLE_UNDERWRITER',
  CLAIMS_OFFICER: 'ROLE_CLAIMS_OFFICER',
  ADMIN: 'ROLE_ADMIN',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  ROLE_CUSTOMER: 'Customer',
  ROLE_UNDERWRITER: 'Underwriter',
  ROLE_CLAIMS_OFFICER: 'Claims Officer',
  ROLE_ADMIN: 'Administrator',
};

export const ROLE_DASHBOARD_PATHS: Record<UserRole, string> = {
  ROLE_CUSTOMER: '/customer/dashboard',
  ROLE_UNDERWRITER: '/underwriter/dashboard',
  ROLE_CLAIMS_OFFICER: '/claims-officer/dashboard',
  ROLE_ADMIN: '/admin/dashboard',
};
