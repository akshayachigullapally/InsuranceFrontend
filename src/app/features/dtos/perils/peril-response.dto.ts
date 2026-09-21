export const PERIL_STATUSES = [
  'ACTIVE',
  'INACTIVE',
  'ARCHIVED',
] as const;

export type PerilStatus = (typeof PERIL_STATUSES)[number];

export const PERIL_MANAGEABLE_STATUSES = [
  'ACTIVE',
  'INACTIVE',
] as const;

export type PerilManageableStatus =
  (typeof PERIL_MANAGEABLE_STATUSES)[number];

export interface PerilResponse {
  id: number;
  perilCode: string;
  perilName: string;
  description: string;
  status: PerilStatus;
  createdBy?: number | null;
  createdAt?: string | null;
  updatedBy?: number | null;
  updatedAt?: string | null;
}

export interface PerilRequest {
  perilCode: string;
  perilName: string;
  description: string;
}

export interface UpdatePerilStatusRequest {
  status: PerilManageableStatus;
}

export interface MessageResponse {
  message: string;
}
