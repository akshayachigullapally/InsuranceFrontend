import { createAction, props } from '@ngrx/store';
import {
  ProductTriggerSyncResponse,
  ProductTriggerThresholdHistoryResponse,
  ProductTriggerThresholdUpdateRequest,
  ProductTriggerThresholdUpdateResponse,
} from '../../dtos/triggers/trigger-condition.dto';
import {
  ProductCategory,
  ProductRequest,
  ProductResponse,
  ProductStatus,
} from '../../dtos/products/product-response.dto';

export const loadProducts = createAction(
  '[Products] Load Products',
);

export const loadProductsSuccess = createAction(
  '[Products] Load Products Success',
  props<{ products: ProductResponse[] }>(),
);

export const loadProductsFailure = createAction(
  '[Products] Load Products Failure',
  props<{ error: string }>(),
);

export const loadProductsByCategory = createAction(
  '[Products] Load Products By Category',
  props<{ category: ProductCategory }>(),
);

export const loadProductsByCategorySuccess = createAction(
  '[Products] Load Products By Category Success',
  props<{ products: ProductResponse[] }>(),
);

export const loadProductsByCategoryFailure = createAction(
  '[Products] Load Products By Category Failure',
  props<{ error: string }>(),
);

export const loadProduct = createAction(
  '[Products] Load Product',
  props<{ productId: number }>(),
);

export const loadProductSuccess = createAction(
  '[Products] Load Product Success',
  props<{ product: ProductResponse }>(),
);

export const loadProductFailure = createAction(
  '[Products] Load Product Failure',
  props<{ error: string }>(),
);

export const loadAdminProducts = createAction(
  '[Products] Load Admin Products',
);

export const loadAdminProductsSuccess = createAction(
  '[Products] Load Admin Products Success',
  props<{ products: ProductResponse[] }>(),
);

export const loadAdminProductsFailure = createAction(
  '[Products] Load Admin Products Failure',
  props<{ error: string }>(),
);

export const loadAdminProduct = createAction(
  '[Products] Load Admin Product',
  props<{ productId: number }>(),
);

export const loadAdminProductSuccess = createAction(
  '[Products] Load Admin Product Success',
  props<{ product: ProductResponse }>(),
);

export const loadAdminProductFailure = createAction(
  '[Products] Load Admin Product Failure',
  props<{ error: string }>(),
);

export const createProduct = createAction(
  '[Products] Create Product',
  props<{ request: ProductRequest }>(),
);

export const createProductSuccess = createAction(
  '[Products] Create Product Success',
  props<{ product: ProductResponse }>(),
);

export const createProductFailure = createAction(
  '[Products] Create Product Failure',
  props<{ error: string }>(),
);

export const updateProduct = createAction(
  '[Products] Update Product',
  props<{ productId: number; request: ProductRequest }>(),
);

export const updateProductSuccess = createAction(
  '[Products] Update Product Success',
  props<{ product: ProductResponse }>(),
);

export const updateProductFailure = createAction(
  '[Products] Update Product Failure',
  props<{ error: string }>(),
);

export const updateProductStatus = createAction(
  '[Products] Update Product Status',
  props<{ productId: number; status: ProductStatus }>(),
);

export const updateProductStatusSuccess = createAction(
  '[Products] Update Product Status Success',
  props<{ product: ProductResponse }>(),
);

export const updateProductStatusFailure = createAction(
  '[Products] Update Product Status Failure',
  props<{ error: string }>(),
);

export const deleteProduct = createAction(
  '[Products] Delete Product',
  props<{ productId: number }>(),
);

export const deleteProductSuccess = createAction(
  '[Products] Delete Product Success',
  props<{ productId: number }>(),
);

export const deleteProductFailure = createAction(
  '[Products] Delete Product Failure',
  props<{ error: string }>(),
);

export const updateProductThreshold = createAction(
  '[Products] Update Product Threshold',
  props<{
    productId: number;
    request: ProductTriggerThresholdUpdateRequest;
  }>(),
);

export const updateProductThresholdSuccess = createAction(
  '[Products] Update Product Threshold Success',
  props<{ result: ProductTriggerThresholdUpdateResponse }>(),
);

export const updateProductThresholdFailure = createAction(
  '[Products] Update Product Threshold Failure',
  props<{ error: string }>(),
);

export const loadProductThresholdHistory = createAction(
  '[Products] Load Product Threshold History',
  props<{ productId: number }>(),
);

export const loadProductThresholdHistorySuccess = createAction(
  '[Products] Load Product Threshold History Success',
  props<{
    productId: number;
    history: ProductTriggerThresholdHistoryResponse[];
  }>(),
);

export const loadProductThresholdHistoryFailure = createAction(
  '[Products] Load Product Threshold History Failure',
  props<{ error: string }>(),
);

export const clearProductThresholdUpdate = createAction(
  '[Products] Clear Product Threshold Update',
);

export const setProductFilters = createAction(
  '[Products] Set Filters',
  props<{
    filters: {
      category?: ProductCategory;
      status?: ProductStatus;
      search?: string;
    };
  }>(),
);

export const clearProductFilters = createAction(
  '[Products] Clear Filters',
);

export const clearProductsError = createAction(
  '[Products] Clear Error',
);

export const clearSelectedProduct = createAction(
  '[Products] Clear Selected Product',
);