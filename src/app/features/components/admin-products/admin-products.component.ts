import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  PRODUCT_STATUSES,
  ProductResponse,
  ProductStatus,
} from '../../dtos/products/product-response.dto';
import {
  clearProductsError,
  deleteProduct,
  loadAdminProducts,
  updateProductStatus,
} from '../../state/products/products.actions';
import {
  selectAdminProducts,
  selectProductsError,
  selectProductsLoading,
  selectProductsSaving,
} from '../../state/products/products.selectors';
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
  styleUrl: './admin-products.component.css',
})
export class AdminProductsComponent implements OnInit {
  readonly products$: Observable<ProductResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly saving$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  protected readonly statuses = PRODUCT_STATUSES;

  constructor(private readonly store: Store) {
    this.products$ = this.store.select(selectAdminProducts);
    this.loading$ = this.store.select(selectProductsLoading);
    this.saving$ = this.store.select(selectProductsSaving);
    this.error$ = this.store.select(selectProductsError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearProductsError());
    this.store.dispatch(loadAdminProducts());
  }

  protected onStatusChange(
    product: ProductResponse,
    event: Event,
  ): void {
    const status = (event.target as HTMLSelectElement).value as ProductStatus;

    if (status === product.status) {
      return;
    }

    this.store.dispatch(updateProductStatus({
      productId: product.id,
      status,
    }));
  }

  protected onDelete(productId: number): void {
    const confirmed = window.confirm(
      'Archive this product? It will no longer be available to customers.',
    );

    if (!confirmed) {
      return;
    }

    this.store.dispatch(deleteProduct({ productId }));
  }

  protected categoryLabel(category: string): string {
    return category.replaceAll('_', ' ');
  }
}