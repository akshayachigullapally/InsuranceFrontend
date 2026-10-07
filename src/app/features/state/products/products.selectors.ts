import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductsState } from './products.state';

const selectProductsState = createFeatureSelector<ProductsState>('products');

export const selectProducts = createSelector(selectProductsState, (state) => state.products);

export const selectAdminProducts = createSelector(
  selectProductsState,
  (state) => state.adminProducts,
);

export const selectSelectedProduct = createSelector(
  selectProductsState,
  (state) => state.selectedProduct,
);

export const selectProductsLoading = createSelector(
  selectProductsState,
  (state) => state.isLoading,
);

export const selectProductsSaving = createSelector(selectProductsState, (state) => state.isSaving);

export const selectProductsError = createSelector(selectProductsState, (state) => state.error);

export const selectProductThresholdHistory = createSelector(
  selectProductsState,
  (state) => state.thresholdHistory,
);

export const selectProductThresholdUpdate = createSelector(
  selectProductsState,
  (state) => state.thresholdUpdate,
);

export const selectActiveProductCount = createSelector(
  selectAdminProducts,
  (products) => products.filter((product) => product.status === 'ACTIVE').length,
);
