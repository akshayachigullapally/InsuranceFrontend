export const ZONE_STATUSES = [
  'ACTIVE',
  'INACTIVE',
  'ARCHIVED',
] as const;

export type ZoneStatus = (typeof ZONE_STATUSES)[number];

export const ZONE_MANAGEABLE_STATUSES = [
  'ACTIVE',
  'INACTIVE',
] as const;

export type ZoneManageableStatus =
  (typeof ZONE_MANAGEABLE_STATUSES)[number];

export interface ZoneResponse {
  id: number;
  zoneCode: string;
  zoneName: string;
  country: string;
  state: string;
  district: string;
  postalCode?: string | null;
  latitude: number;
  longitude: number;
  radiusKm: number;
  status: ZoneStatus;
  createdBy?: number | null;
  createdAt?: string | null;
  updatedBy?: number | null;
  updatedAt?: string | null;
}

export interface ZoneRequest {
  zoneCode: string;
  zoneName: string;
  country: string;
  state: string;
  district: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export interface UpdateZoneStatusRequest {
  status: ZoneManageableStatus;
}

export interface MessageResponse {
  message: string;
}