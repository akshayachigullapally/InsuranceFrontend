export const CLAIM_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'SETTLED',
  'REJECTED',
  'CANCELLED',
] as const;

export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export interface ClaimResponse {
  id: number;
  claimNumber: string;
  customerId: number;
  policyId: number;
  policyNumber: string;
  productId: number;
  triggerEventId?: number | null;
  triggerEventReference?: string | null;
  triggerDefinitionId?: number | null;
  perilId?: number | null;
  locationZoneId: number;
  incidentType: string;
  incidentDate: string;
  incidentLocation: string;
  description: string;
  claimedAmount: number;
  approvedAmount?: number | null;
  status: ClaimStatus;
  rejectionReason?: string | null;
  reviewedBy?: number | null;
  reviewedAt?: string | null;
  submittedAt: string;
  updatedAt: string;
  claimSource?: string | null;
  manualReviewRequired?: boolean | null;
  manualReviewReason?: string | null;
  evidenceDescription?: string | null;
}

export interface CreateClaimRequest {
  policyId: number;
  incidentType: string;
  incidentDate: string;
  incidentLocation: string;
  description: string;
  claimedAmount: number;
  claimSource?: string;
  customerConfirmedLoss?: boolean;
  evidenceDescription?: string;
}

export interface ApproveClaimRequest {
  approvedAmount: number;
}

export interface RejectClaimRequest {
  reason: string;
}

export interface SettleClaimRequest {
  notes?: string;
}

export interface ClaimTimelineResponse {
  id: number;
  oldStatus: string;
  newStatus: string;
  action: string;
  actionBy: number;
  actionByRole: string;
  notes?: string | null;
  createdAt: string;
}

export interface MessageResponse {
  message: string;
}

/** An action the signed-in claims officer took on a claim. */
export interface ClaimReviewHistoryResponse {
  timelineId: number;
  claimId: number;
  claimNumber: string;
  policyNumber?: string | null;
  customerId: number;
  claimSource?: string | null;
  action: string;
  oldStatus?: string | null;
  newStatus: string;
  notes?: string | null;
  actedAt: string;
  claimedAmount?: number | null;
  approvedAmount?: number | null;
  currentStatus: string;
}
