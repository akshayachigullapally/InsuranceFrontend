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
  createdFromTriggerEvent?: boolean | null;
  triggerMeasurementType?: string | null;
  triggerMeasurementUnit?: string | null;
  triggerObservedValue?: number | null;
  triggerThresholdValue?: number | null;
  triggerComparisonOperator?: string | null;
  triggerWindowStart?: string | null;
  triggerWindowEnd?: string | null;
}

export interface ClaimDocumentResponse {
  id: number;
  claimId: number;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export const MAX_CLAIM_DOCUMENTS = 3;
export const MAX_CLAIM_DOCUMENT_BYTES = 5 * 1024 * 1024;
export const CLAIM_DOCUMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

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
