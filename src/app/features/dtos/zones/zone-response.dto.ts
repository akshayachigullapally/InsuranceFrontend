const ZONE_STATUSES = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;

export type ZoneStatus = (typeof ZONE_STATUSES)[number];

export const ZONE_MANAGEABLE_STATUSES = ['ACTIVE', 'INACTIVE'] as const;

export type ZoneManageableStatus = (typeof ZONE_MANAGEABLE_STATUSES)[number];

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
  /** While true, no new policies can be sold in the zone. */
  weatherAlert?: boolean;
  alertMessage?: string | null;
  alertRaisedAt?: string | null;
  /** Maximum total sum insured of open policies; null means no cap. */
  maxExposure?: number | null;
}

export interface ZoneAlertRequest {
  active: boolean;
  message?: string;
}

export interface ZoneExposureCapRequest {
  maxExposure: number | null;
}

/** Cover carried by a zone against its cap (GET /api/policies/admin/zone-exposure). */
export interface ZoneExposureResponse {
  zoneId: number;
  zoneCode: string;
  zoneName: string;
  weatherAlert: boolean;
  alertMessage?: string | null;
  alertRaisedAt?: string | null;
  maxExposure?: number | null;
  activeExposure: number;
  pendingExposure: number;
  usedExposure: number;
  remainingExposure?: number | null;
  utilizationPercent?: number | null;
  activePolicyCount: number;
  pendingPolicyCount: number;
  salesOpen: boolean;
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
