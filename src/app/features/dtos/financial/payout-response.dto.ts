const PAYOUT_STATUSES = ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'] as const;

export type PayoutStatus = (typeof PAYOUT_STATUSES)[number];

export interface CreatePayoutRequest {
  claimId: number;
}

export interface PayoutActionRequest {
  externalReference: string;
  failureReason?: string;
}

export interface PayoutResponse {
  id: number;
  payoutReference: string;
  customerId: number;
  claimId: number;
  claimNumber: string;
  policyId: number;
  triggerEventId: number | null;
  amount: number;
  status: PayoutStatus;
  externalReference: string | null;
  failureReason: string | null;
  retryCount: number;
  createdAt: string;
  processedAt: string | null;
  updatedAt: string | null;
}

export interface MessageResponse {
  message: string;
}
