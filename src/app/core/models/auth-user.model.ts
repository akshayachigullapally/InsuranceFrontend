export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  customerId?: number;
}
