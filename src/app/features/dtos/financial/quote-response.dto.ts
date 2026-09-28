const QUOTE_STATUSES = ['CREATED', 'ACCEPTED', 'EXPIRED', 'CANCELLED', 'CONSUMED'] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export interface CreateQuoteRequest {
  productId: number;
  locationZoneId: number;
  sumInsured: number;
  termMonths: number;
}

export interface QuoteResponse {
  id: number;
  quoteReference: string;
  customerId: number;
  productId: number;
  locationZoneId: number;
  sumInsured: number;
  termMonths: number;
  annualRate: number;
  termFactor: number;
  locationFactor: number;
  premiumAmount: number;
  status: QuoteStatus;
  expiresAt: string | null;
  createdAt: string;
  acceptedAt: string | null;
  policyId: number | null;
  policyNumber: string | null;
}

export interface MessageResponse {
  message: string;
}
