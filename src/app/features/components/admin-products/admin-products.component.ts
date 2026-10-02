import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  PRODUCT_STATUSES,
  ProductResponse,
  ProductStatus,
} from '../../dtos/products/product-response.dto';
import {
  clearProductsError,
  deleteProduct,
  deleteProductFailure,
  deleteProductSuccess,
  loadAdminProducts,
  updateProductStatus,
  updateProductStatusFailure,
  updateProductStatusSuccess,
} from '../../state/products/products.actions';
import {
  selectAdminProducts,
  selectProductsError,
  selectProductsLoading,
  selectProductsSaving,
} from '../../state/products/products.selectors';
import { ToastService } from '../../../shared/services/toast.service';
import { DialogService } from '../../../shared/services/dialog.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    AsyncPipe,
    DecimalPipe,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './admin-products.component.html',
})
export class AdminProductsComponent implements OnInit, OnDestroy {
  readonly products$: Observable<ProductResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly saving$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  protected readonly statuses = PRODUCT_STATUSES;

  private readonly destroy$ = new Subject<void>();

  private readonly dialog = inject(DialogService);

  constructor(
    private readonly store: Store,
    private readonly actions$: Actions,
    private readonly toast: ToastService,
  ) {
    this.products$ = this.store.select(selectAdminProducts);
    this.loading$ = this.store.select(selectProductsLoading);
    this.saving$ = this.store.select(selectProductsSaving);
    this.error$ = this.store.select(selectProductsError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearProductsError());
    this.store.dispatch(loadAdminProducts());

    this.actions$.pipe(ofType(deleteProductSuccess), takeUntil(this.destroy$)).subscribe(() =>
      this.toast.show({
        type: 'success',
        icon: '✅',
        title: 'Product archived',
        message: 'The product was archived successfully.',
      }),
    );

    this.actions$
      .pipe(ofType(deleteProductFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) =>
        this.toast.show({
          type: 'error',
          icon: '⚠️',
          title: 'Could not archive product',
          message: error,
        }),
      );

    this.actions$
      .pipe(ofType(updateProductStatusSuccess), takeUntil(this.destroy$))
      .subscribe(({ product }) =>
        this.toast.show({
          type: 'success',
          icon: '✅',
          title: 'Product status updated',
          message: `${product.name} is now ${product.status}.`,
        }),
      );

    this.actions$
      .pipe(ofType(updateProductStatusFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) =>
        this.toast.show({
          type: 'error',
          icon: '⚠️',
          title: 'Could not update product status',
          message: error,
        }),
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onStatusChange(product: ProductResponse, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const status = select.value as ProductStatus;

    // Keep showing the saved status until the server confirms the change;
    // the list re-renders with the new status on success.
    select.value = product.status;

    if (status === product.status) {
      return;
    }

    this.store.dispatch(
      updateProductStatus({
        productId: product.id,
        status,
      }),
    );
  }

  protected async onDelete(productId: number): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: 'Archive this product?',
      message: 'It will no longer be available to customers. Existing policies are not affected.',
      confirmLabel: 'Archive product',
      danger: true,
    });

    if (!confirmed) {
      return;
    }

    this.store.dispatch(deleteProduct({ productId }));
  }

  protected categoryLabel(category: string): string {
    const words = category.replaceAll('_', ' ').toLowerCase();
    return words.charAt(0).toUpperCase() + words.slice(1);
  }
}
