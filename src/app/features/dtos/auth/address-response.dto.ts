export interface AddressResponse {
  id?: number;
  addressLineOne: string;
  addressLineTwo?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  primaryAddress?: boolean;
  createdAt?: string;
  updatedAt?: string;
}