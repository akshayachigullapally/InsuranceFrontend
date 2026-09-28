import { CustomerSegment } from './user-response.dto';

/** Body of PUT /api/users/me (Auth Service UpdateProfileRequest). */
export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  customerSegment: CustomerSegment;
  address: {
    addressLineOne: string;
    addressLineTwo?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}
