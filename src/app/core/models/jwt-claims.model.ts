export interface JwtClaims {
  sub: string;
  email: string;
  role: string;
  customerId?: number;
  iat?: number;
  exp?: number;
}