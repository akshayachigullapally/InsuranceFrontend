import {
  ProductCategory,
  ProductResponse,
  ProductStatus,
} from '../../dtos/products/product-response.dto';
import {
  ProductTriggerThresholdHistoryResponse,
  ProductTriggerThresholdUpdateResponse,
} from '../../dtos/triggers/trigger-condition.dto';

export interface ProductFilters {
  category?: ProductCategory;
  status?: ProductStatus;
  search?: string;
}

export interface ProductsState {
  products: ProductResponse[];
  adminProducts: ProductResponse[];
  selectedProduct: ProductResponse | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  filters: ProductFilters;
  thresholdHistory: ProductTriggerThresholdHistoryResponse[];
  thresholdHistoryProductId: number | null;
  thresholdUpdate: ProductTriggerThresholdUpdateResponse | null;
}

export const initialProductsState: ProductsState = {
  products: [],
  adminProducts: [],
  selectedProduct: null,
  isLoading: false,
  isSaving: false,
  error: null,
  filters: {},
  thresholdHistory: [],
  thresholdHistoryProductId: null,
  thresholdUpdate: null,
};
