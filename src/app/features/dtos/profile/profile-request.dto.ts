export const CUSTOMER_SEGMENTS = ['INDIVIDUAL', 'FARMER', 'SMALL_BUSINESS', 'ENTERPRISE'] as const;
export type CustomerSegment = (typeof CUSTOMER_SEGMENTS)[number];

export const USER_STATUSES = ['ACTIVE', 'SUSPENDED', 'INACTIVE'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export interface AddressRequest {
  addressLineOne: string;
  addressLineTwo?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  primaryAddress?: boolean;
}

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  customerSegment: string;
  address: AddressRequest;
}

export interface UpdateUserStatusRequest {
  status: string;
}