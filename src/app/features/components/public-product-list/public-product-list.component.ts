import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  PRODUCT_CATEGORIES,
  ProductCategory,
  ProductResponse,
} from '../../dtos/products/product-response.dto';
import {
  clearProductsError,
  loadProducts,
  loadProductsByCategory,
} from '../../state/products/products.actions';
import {
  selectProducts,
  selectProductsError,
  selectProductsLoading,
} from '../../state/products/products.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { buildTriggerSentence, hasTriggerCondition } from '../../utils/trigger-display';

const CATEGORY_ICONS: Record<ProductCategory, string> = {
  WEATHER: '🌦️',
  FLOOD: '🌊',
  AGRICULTURE: '🌾',
  BUSINESS_INTERRUPTION: '🏢',
  TRAVEL: '✈️',
  CYCLONE: '🌀',
  OTHER: '🛡️',
};

interface CategoryBadge {
  label: string;
  value: ProductCategory;
}

@Component({
  selector: 'app-public-product-list',
  standalone: true,
  imports: [
    AsyncPipe,
    DecimalPipe,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    EmptyStateComponent,
  ],
  templateUrl: './public-product-list.component.html',
})
export class PublicProductListComponent implements OnInit {
  readonly products$: Observable<ProductResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  protected readonly categories: CategoryBadge[] = PRODUCT_CATEGORIES.map((category) => ({
    label: this.categoryLabel(category),
    value: category,
  }));

  protected selectedCategory: ProductCategory | null = null;

  constructor(private readonly store: Store) {
    this.products$ = this.store.select(selectProducts);
    this.loading$ = this.store.select(selectProductsLoading);
    this.error$ = this.store.select(selectProductsError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearProductsError());
    this.store.dispatch(loadProducts());
  }

  protected applyCategory(category: ProductCategory | null): void {
    this.selectedCategory = category;

    if (category) {
      this.store.dispatch(
        loadProductsByCategory({
          category,
        }),
      );
      return;
    }

    this.store.dispatch(loadProducts());
  }

  protected categoryIcon(category: ProductCategory): string {
    return CATEGORY_ICONS[category];
  }

  protected categoryLabel(category: ProductCategory): string {
    return category
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  protected hasTrigger(product: ProductResponse): boolean {
    return hasTriggerCondition(product);
  }

  protected triggerSummary(product: ProductResponse): string {
    return buildTriggerSentence(product);
  }
}
