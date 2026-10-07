import { productsReducer } from './products.reducer';
import { initialProductsState, ProductsState } from './products.state';
import * as ProductsActions from './products.actions';
import { ProductResponse } from '../../dtos/products/product-response.dto';

function makeProduct(id: number, status: ProductResponse['status'] = 'ACTIVE'): ProductResponse {
  return { id, name: `Product ${id}`, productCode: `P-${id}`, status } as ProductResponse;
}

describe('productsReducer', () => {
  it('returns the initial state for an unknown action', () => {
    expect(productsReducer(undefined, { type: '[Unknown]' } as never)).toEqual(initialProductsState);
  });

  it('archives a deleted product instead of removing it from the admin list', () => {
    const current: ProductsState = {
      ...initialProductsState,
      products: [makeProduct(1)],
      adminProducts: [makeProduct(1)],
      selectedProduct: makeProduct(1),
    };

    const state = productsReducer(current, ProductsActions.deleteProductSuccess({ productId: 1 }));

    expect(state.adminProducts[0].status).toBe('ARCHIVED');
    expect(state.products).toEqual([]);
    expect(state.selectedProduct?.status).toBe('ARCHIVED');
  });

  it('tracks the threshold update lifecycle', () => {
    const saving = productsReducer(
      initialProductsState,
      ProductsActions.updateProductThreshold({ productId: 1, request: {} as never }),
    );
    expect(saving.isSaving).toBe(true);

    const result = { productId: 1 } as never;
    const saved = productsReducer(saving, ProductsActions.updateProductThresholdSuccess({ result }));
    expect(saved.thresholdUpdate).toEqual(result);
    expect(saved.isSaving).toBe(false);

    expect(productsReducer(saved, ProductsActions.clearProductThresholdUpdate()).thresholdUpdate).toBeNull();
  });

  it('merges filters and clears them', () => {
    const withCategory = productsReducer(
      initialProductsState,
      ProductsActions.setProductFilters({ filters: { category: 'FLOOD' } }),
    );
    const withSearch = productsReducer(
      withCategory,
      ProductsActions.setProductFilters({ filters: { search: 'rain' } }),
    );

    expect(withSearch.filters).toEqual({ category: 'FLOOD', search: 'rain' });
    expect(productsReducer(withSearch, ProductsActions.clearProductFilters()).filters).toEqual({});
  });
});
