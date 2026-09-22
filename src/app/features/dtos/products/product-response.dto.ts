export const PRODUCT_CATEGORIES = [
  'WEATHER',
  'FLOOD',
  'AGRICULTURE',
  'BUSINESS_INTERRUPTION',
  'TRAVEL',
  'CYCLONE',
  'OTHER',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_STATUSES = ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface CoverageResponse {
  id: number;
  coverageCode: string;
  name: string;
  description?: string | null;
  coverageLimit?: number | null;
  mandatory: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CoverageRequest {
  coverageCode: string;
  name: string;
  description?: string;
  coverageLimit?: number;
  mandatory: boolean;
  active: boolean;
}

export interface ProductResponse {
  id: number;
  productCode: string;
  name: string;
  description?: string | null;
  category: ProductCategory;
  status: ProductStatus;
  minimumSumInsured: number;
  maximumSumInsured: number;
  minimumTermMonths: number;
  maximumTermMonths: number;
  eligibilityDescription?: string | null;
  perilCode?: string | null;
  measurementType?: string | null;
  measurementUnit?: string | null;
  thresholdValue?: number | null;
  comparisonOperator?: string | null;
  aggregationType?: string | null;
  observationWindowHours?: number | null;
  minimumObservationCount?: number | null;
  triggerDescription?: string | null;
  humanReadableTrigger?: string | null;
  createdBy?: number;
  coverages: CoverageResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductRequest {
  productCode: string;
  name: string;
  category: ProductCategory;
  description?: string;
  minimumSumInsured: number;
  maximumSumInsured: number;
  minimumTermMonths: number;
  maximumTermMonths: number;
  eligibilityDescription?: string;
  perilCode?: string;
  measurementType?: string;
  measurementUnit?: string;
  thresholdValue?: number;
  comparisonOperator?: string;
  aggregationType?: string;
  observationWindowHours?: number;
  minimumObservationCount?: number;
  triggerDescription?: string;
  coverages: CoverageRequest[];
}

export interface ProductStatusRequest {
  status: ProductStatus;
}

export interface MessageResponse {
  message: string;
}