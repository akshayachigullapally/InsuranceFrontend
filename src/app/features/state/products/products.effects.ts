import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  catchError,
  exhaustMap,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import {
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
  syncProductTrigger,
  syncProductTriggerFailure,
  syncProductTriggerSuccess,
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

export function httpErrorMessage(error: unknown): string {
  const response = error as {
    error?: {
      message?: string;
      messages?: string[];
    };
    message?: string;
  };

  if (response?.error?.messages?.length) {
    return response.error.messages.join('. ');
  }

  if (response?.error?.message) {
    return response.error.message;
  }

  if (response?.message) {
    return response.message;
  }

  return 'An unexpected error occurred.';
}

@Injectable()
export class ProductsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly productService: ProductService,
    private readonly router: Router,
  ) {}

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProducts),
      switchMap(() =>
        this.productService.getActiveProducts().pipe(
          map(products => loadProductsSuccess({ products })),
          catchError(error =>
            of(loadProductsFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  loadProductsByCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProductsByCategory),
      switchMap(({ category }) =>
        this.productService.getProductsByCategory(category).pipe(
          map(products =>
            loadProductsByCategorySuccess({ products }),
          ),
          catchError(error =>
            of(loadProductsByCategoryFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  loadProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProduct),
      switchMap(({ productId }) =>
        this.productService.getProduct(productId).pipe(
          map(product => loadProductSuccess({ product })),
          catchError(error =>
            of(loadProductFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  loadAdminProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAdminProducts),
      switchMap(() =>
        this.productService.getAdminProducts().pipe(
          map(products =>
            loadAdminProductsSuccess({ products }),
          ),
          catchError(error =>
            of(loadAdminProductsFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  loadAdminProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAdminProduct),
      switchMap(({ productId }) =>
        this.productService.getAdminProduct(productId).pipe(
          map(product =>
            loadAdminProductSuccess({ product }),
          ),
          catchError(error =>
            of(loadAdminProductFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  createProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createProduct),
      exhaustMap(({ request }) =>
        this.productService.createProduct(request).pipe(
          map(product => createProductSuccess({ product })),
          catchError(error =>
            of(createProductFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  updateProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateProduct),
      exhaustMap(({ productId, request }) =>
        this.productService.updateProduct(productId, request).pipe(
          map(product => updateProductSuccess({ product })),
          catchError(error =>
            of(updateProductFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  updateProductStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateProductStatus),
      exhaustMap(({ productId, status }) =>
        this.productService.updateProductStatus(productId, status).pipe(
          map(product =>
            updateProductStatusSuccess({ product }),
          ),
          catchError(error =>
            of(updateProductStatusFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  deleteProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteProduct),
      exhaustMap(({ productId }) =>
        this.productService.deleteProduct(productId).pipe(
          map(() => deleteProductSuccess({ productId })),
          catchError(error =>
            of(deleteProductFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  updateProductThreshold$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateProductThreshold),
      exhaustMap(({ productId, request }) =>
        this.productService.updateThreshold(productId, request).pipe(
          switchMap(result => [
            updateProductThresholdSuccess({ result }),
            loadAdminProduct({ productId }),
          ]),
          catchError(error =>
            of(updateProductThresholdFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  loadThresholdHistory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProductThresholdHistory),
      switchMap(({ productId }) =>
        this.productService.getThresholdHistory(productId).pipe(
          map(history =>
            loadProductThresholdHistorySuccess({
              productId,
              history,
            }),
          ),
          catchError(error =>
            of(loadProductThresholdHistoryFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  syncProductTrigger$ = createEffect(() =>
    this.actions$.pipe(
      ofType(syncProductTrigger),
      exhaustMap(({ productId }) =>
        this.productService.syncTrigger(productId).pipe(
          switchMap(result => [
            syncProductTriggerSuccess({ result }),
            loadAdminProduct({ productId }),
          ]),
          catchError(error =>
            of(syncProductTriggerFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  redirectAfterSave$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(createProductSuccess, updateProductSuccess),
        tap(() =>
          void this.router.navigate(['/admin/products']),
        ),
      ),
    { dispatch: false },
  );
}