import { Action, createReducer, on } from '@ngrx/store';
import { ProductResponse } from '../../dtos/products/product-response.dto';
import {
  clearProductFilters,
  clearProductThresholdUpdate,
  clearProductsError,
  clearSelectedProduct,
  createProduct,
  createProductFailure,
  createProductSuccess,
  deleteProduct,
  deleteProductFailure,
  deleteProductSuccess,
  loadAdminProduct,
  loadAdminProductFailure,
  loadAdminProductSuccess,
  loadAdminProducts,
  loadAdminProductsFailure,
  loadAdminProductsSuccess,
  loadProduct,
  loadProductFailure,
  loadProductSuccess,
  loadProducts,
  loadProductsByCategory,
  loadProductsByCategoryFailure,
  loadProductsByCategorySuccess,
  loadProductsFailure,
  loadProductsSuccess,
  loadProductThresholdHistory,
  loadProductThresholdHistoryFailure,
  loadProductThresholdHistorySuccess,
  setProductFilters,
  updateProduct,
  updateProductFailure,
  updateProductStatus,
  updateProductStatusFailure,
  updateProductStatusSuccess,
  updateProductSuccess,
  updateProductThreshold,
  updateProductThresholdFailure,
  updateProductThresholdSuccess,
} from './products.actions';
import {
  initialProductsState,
  ProductsState,
} from './products.state';

function upsert(
  products: ProductResponse[],
  product: ProductResponse,
): ProductResponse[] {
  const exists = products.some(item => item.id === product.id);

  return exists
    ? products.map(item =>
        item.id === product.id ? product : item,
      )
    : [product, ...products];
}

function updateExisting(
  products: ProductResponse[],
  product: ProductResponse,
): ProductResponse[] {
  return products.map(item =>
    item.id === product.id ? product : item,
  );
}

function updatePublicProducts(
  products: ProductResponse[],
  product: ProductResponse,
): ProductResponse[] {
  if (product.status === 'ACTIVE') {
    return upsert(products, product);
  }

  return products.filter(item => item.id !== product.id);
}

export const productsReducer = createReducer(
  initialProductsState,

  on(
    loadProducts,
    loadProductsByCategory,
    (state): ProductsState => ({
      ...state,
      isLoading: true,
      error: null,
    }),
  ),

  on(
    loadProductsSuccess,
    loadProductsByCategorySuccess,
    (state, { products }): ProductsState => ({
      ...state,
      products,
      isLoading: false,
    }),
  ),

  on(
    loadProductsFailure,
    loadProductsByCategoryFailure,
    (state, { error }): ProductsState => ({
      ...state,
      isLoading: false,
      error,
    }),
  ),

  on(
    loadAdminProducts,
    (state): ProductsState => ({
      ...state,
      isLoading: true,
      error: null,
    }),
  ),

  on(
    loadAdminProductsSuccess,
    (state, { products }): ProductsState => ({
      ...state,
      adminProducts: products,
      isLoading: false,
    }),
  ),

  on(
    loadAdminProductsFailure,
    (state, { error }): ProductsState => ({
      ...state,
      isLoading: false,
      error,
    }),
  ),

  on(
    loadProduct,
    loadAdminProduct,
    (state): ProductsState => ({
      ...state,
      selectedProduct: null,
      isLoading: true,
      error: null,
    }),
  ),

  on(
    loadProductSuccess,
    (state, { product }): ProductsState => ({
      ...state,
      selectedProduct: product,
      products: upsert(state.products, product),
      isLoading: false,
    }),
  ),

  on(
    loadAdminProductSuccess,
    (state, { product }): ProductsState => ({
      ...state,
      selectedProduct: product,
      adminProducts: state.adminProducts.length
        ? updateExisting(state.adminProducts, product)
        : state.adminProducts,
      isLoading: false,
    }),
  ),

  on(
    loadProductFailure,
    loadAdminProductFailure,
    (state, { error }): ProductsState => ({
      ...state,
      isLoading: false,
      error,
    }),
  ),

  on(
    createProduct,
    updateProduct,
    updateProductStatus,
    deleteProduct,
    (state): ProductsState => ({
      ...state,
      isSaving: true,
      error: null,
    }),
  ),

  on(
    createProductSuccess,
    (state, { product }): ProductsState => ({
      ...state,
      adminProducts: upsert(state.adminProducts, product),
      products: updatePublicProducts(
        state.products,
        product,
      ),
      selectedProduct: product,
      isSaving: false,
    }),
  ),

  on(
    updateProductSuccess,
    updateProductStatusSuccess,
    (state, { product }): ProductsState => ({
      ...state,
      adminProducts: upsert(
        state.adminProducts,
        product,
      ),
      products: updatePublicProducts(
        state.products,
        product,
      ),
      selectedProduct:
        state.selectedProduct?.id === product.id
          ? product
          : state.selectedProduct,
      isSaving: false,
    }),
  ),

  on(
    deleteProductSuccess,
    (state, { productId }): ProductsState => ({
      ...state,
      adminProducts: state.adminProducts.map(product =>
        product.id === productId
          ? {
              ...product,
              status: 'ARCHIVED',
            }
          : product,
      ),
      products: state.products.filter(
        product => product.id !== productId,
      ),
      selectedProduct:
        state.selectedProduct?.id === productId
          ? {
              ...state.selectedProduct,
              status: 'ARCHIVED',
            }
          : state.selectedProduct,
      isSaving: false,
    }),
  ),

  on(
    createProductFailure,
    updateProductFailure,
    updateProductStatusFailure,
    deleteProductFailure,
    updateProductThresholdFailure,
    (state, { error }): ProductsState => ({
      ...state,
      isSaving: false,
      error,
    }),
  ),

  on(
    loadProductThresholdHistory,
    (state): ProductsState => ({
      ...state,
      thresholdHistory: [],
      thresholdHistoryProductId: null,
      error: null,
    }),
  ),

  on(
    loadProductThresholdHistorySuccess,
    (state, { productId, history }): ProductsState => ({
      ...state,
      thresholdHistory: history,
      thresholdHistoryProductId: productId,
    }),
  ),

  on(
    loadProductThresholdHistoryFailure,
    (state, { error }): ProductsState => ({
      ...state,
      thresholdHistory: [],
      thresholdHistoryProductId: null,
      error,
    }),
  ),

  on(
    updateProductThreshold,
    (state): ProductsState => ({
      ...state,
      isSaving: true,
      thresholdUpdate: null,
      error: null,
    }),
  ),

  on(
    updateProductThresholdSuccess,
    (state, { result }): ProductsState => ({
      ...state,
      thresholdUpdate: result,
      isSaving: false,
    }),
  ),

  on(
    clearProductThresholdUpdate,
    (state): ProductsState => ({
      ...state,
      thresholdUpdate: null,
    }),
  ),

  on(
    setProductFilters,
    (state, { filters }): ProductsState => ({
      ...state,
      filters: {
        ...state.filters,
        ...filters,
      },
    }),
  ),

  on(
    clearProductFilters,
    (state): ProductsState => ({
      ...state,
      filters: {},
    }),
  ),

  on(
    clearProductsError,
    (state): ProductsState => ({
      ...state,
      error: null,
    }),
  ),

  on(
    clearSelectedProduct,
    (state): ProductsState => ({
      ...state,
      selectedProduct: null,
    }),
  ),
);

export function reducer(
  state: ProductsState | undefined,
  action: Action,
): ProductsState {
  return productsReducer(state, action);
}