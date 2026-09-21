import { JwtClaims } from './jwt-claims.model';

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  customerId?: number;
}

export function authUserFromClaims(claims: JwtClaims): AuthUser {
  return {
    id: Number(claims.sub),
    fullName: '',
    email: claims.email,
    role: claims.role,
    customerId: claims.customerId,
  };
}

export function authUserRole(user: AuthUser | null | undefined): string | null {
  return user ? user.role : null;
}