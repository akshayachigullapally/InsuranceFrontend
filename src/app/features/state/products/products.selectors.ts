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

const selectProductFilters = createSelector(selectProductsState, (state) => state.filters);

export const selectProductThresholdHistory = createSelector(
  selectProductsState,
  (state) => state.thresholdHistory,
);

export const selectProductThresholdUpdate = createSelector(
  selectProductsState,
  (state) => state.thresholdUpdate,
);

export const selectFilteredAdminProducts = createSelector(
  selectAdminProducts,
  selectProductFilters,
  (products, filters) => {
    const search = filters.search?.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = !filters.category || product.category === filters.category;

      const matchesStatus = !filters.status || product.status === filters.status;

      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.productCode.toLowerCase().includes(search) ||
        product.description?.toLowerCase().includes(search);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  },
);

export const selectActiveProductCount = createSelector(
  selectAdminProducts,
  (products) => products.filter((product) => product.status === 'ACTIVE').length,
);

export const selectDraftProductCount = createSelector(
  selectAdminProducts,
  (products) => products.filter((product) => product.status === 'DRAFT').length,
);

export const selectInactiveProductCount = createSelector(
  selectAdminProducts,
  (products) => products.filter((product) => product.status === 'INACTIVE').length,
);

export const selectArchivedProductCount = createSelector(
  selectAdminProducts,
  (products) => products.filter((product) => product.status === 'ARCHIVED').length,
);

export const selectPublicProductCount = createSelector(
  selectProducts,
  (products) => products.length,
);
