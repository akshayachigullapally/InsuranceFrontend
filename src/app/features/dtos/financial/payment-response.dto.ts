export const PAYMENT_STATUSES = [
  'PENDING',
  'SUCCESS',
  'FAILED',
  'REFUNDED',
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = [
  'MOCK_CARD',
  'MOCK_BANK_TRANSFER',
  'MOCK_UPI',
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface PaymentRequest {
  policyId: number;
  method: PaymentMethod;
}

export interface PaymentActionRequest {
  externalReference: string;
  failureReason?: string;
}

export interface PaymentResponse {
  id: number;
  paymentReference: string;
  customerId: number;
  policyId: number;
  policyNumber: string;
  quoteId: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  externalReference: string | null;
  failureReason: string | null;
  attemptNumber: number;
  createdAt: string;
  completedAt: string | null;
  updatedAt: string | null;
}

export interface MessageResponse {
  message: string;
}
