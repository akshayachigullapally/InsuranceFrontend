import { AddressResponse } from './address-response.dto';

export const USER_STATUSES = [
  'ACTIVE',
  'SUSPENDED',
  'INACTIVE',
] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export const CUSTOMER_SEGMENTS = [
  'INDIVIDUAL',
  'FARMER',
  'SMALL_BUSINESS',
  'ENTERPRISE',
] as const;

export type CustomerSegment =
  (typeof CUSTOMER_SEGMENTS)[number];

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  role: string;
  enabled?: boolean;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  customerSegment?: CustomerSegment | null;
  profileStatus?: UserStatus | null;
  addresses?: AddressResponse[];
  createdAt?: string;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
}