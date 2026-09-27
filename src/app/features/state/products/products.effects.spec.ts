import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { ProductsEffects, httpErrorMessage } from './products.effects';
import * as ProductsActions from './products.actions';
import { ProductService } from '../../services/product.service';
import { ProductResponse } from '../../dtos/products/product-response.dto';

function collect(effect$: Observable<unknown>): unknown[] {
  const results: unknown[] = [];
  effect$.subscribe((action) => results.push(action));
  return results;
}

describe('httpErrorMessage', () => {
  it('prefers joined validation messages, then message, then a fallback', () => {
    expect(httpErrorMessage({ error: { messages: ['A', 'B'] } })).toBe('A. B');
    expect(httpErrorMessage({ error: { message: 'Not found' } })).toBe('Not found');
    expect(httpErrorMessage({ message: 'Network error' })).toBe('Network error');
    expect(httpErrorMessage(null)).toBe('An unexpected error occurred.');
  });
});

describe('ProductsEffects', () => {
  let actions$: Observable<Action>;
  let effects: ProductsEffects;
  let productService: Record<string, ReturnType<typeof vi.fn>>;
  let router: { navigate: ReturnType<typeof vi.fn> };
  const product = { id: 1, name: 'Rain Cover', status: 'ACTIVE' } as ProductResponse;

  beforeEach(() => {
    productService = {
      getActiveProducts: vi.fn(),
      getProductsByCategory: vi.fn(),
      deleteProduct: vi.fn(),
      updateThreshold: vi.fn(),
      getThresholdHistory: vi.fn(),
      createProduct: vi.fn(),
    };
    router = { navigate: vi.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      providers: [
        ProductsEffects,
        provideMockActions(() => actions$),
        { provide: ProductService, useValue: productService },
        { provide: Router, useValue: router },
      ],
    });
    effects = TestBed.inject(ProductsEffects);
  });

  it('loads active products', () => {
    productService['getActiveProducts'].mockReturnValue(of([product]));
    actions$ = of(ProductsActions.loadProducts());

    expect(collect(effects.loadProducts$)).toEqual([ProductsActions.loadProductsSuccess({ products: [product] })]);
  });

  it('loads products by category', () => {
    productService['getProductsByCategory'].mockReturnValue(of([product]));
    actions$ = of(ProductsActions.loadProductsByCategory({ category: 'WEATHER' }));

    expect(collect(effects.loadProductsByCategory$)).toEqual([
      ProductsActions.loadProductsByCategorySuccess({ products: [product] }),
    ]);
    expect(productService['getProductsByCategory']).toHaveBeenCalledWith('WEATHER');
  });

  it('emits deleteProductSuccess with the id', () => {
    productService['deleteProduct'].mockReturnValue(of({ message: 'ok' }));
    actions$ = of(ProductsActions.deleteProduct({ productId: 1 }));

    expect(collect(effects.deleteProduct$)).toEqual([ProductsActions.deleteProductSuccess({ productId: 1 })]);
  });

  it('reloads the product after a threshold update', () => {
    const result = { productId: 1 } as never;
    productService['updateThreshold'].mockReturnValue(of(result));
    actions$ = of(ProductsActions.updateProductThreshold({ productId: 1, request: {} as never }));

    expect(collect(effects.updateProductThreshold$)).toEqual([
      ProductsActions.updateProductThresholdSuccess({ result }),
      ProductsActions.loadAdminProduct({ productId: 1 }),
    ]);
  });

  it('emits a failure for a failed create', () => {
    productService['createProduct'].mockReturnValue(throwError(() => ({ error: { message: 'Duplicate code' } })));
    actions$ = of(ProductsActions.createProduct({ request: {} as never }));

    expect(collect(effects.createProduct$)).toEqual([
      ProductsActions.createProductFailure({ error: 'Duplicate code' }),
    ]);
  });

  it('navigates back to the product list after saving', () => {
    actions$ = of(ProductsActions.createProductSuccess({ product }));

    collect(effects.redirectAfterSave$);

    expect(router.navigate).toHaveBeenCalledWith(['/admin/products']);
  });
});
