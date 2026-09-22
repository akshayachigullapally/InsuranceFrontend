import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ProductResponse } from '../../dtos/products/product-response.dto';
import {
  clearProductsError,
  clearSelectedProduct,
  loadProduct,
} from '../../state/products/products.actions';
import {
  selectProductsError,
  selectProductsLoading,
  selectSelectedProduct,
} from '../../state/products/products.selectors';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ParametricTriggerCardComponent } from '../../../shared/components/parametric-trigger-card/parametric-trigger-card.component';
import { TriggerCondition } from '../../dtos/triggers/trigger-condition.dto';

interface SpecRow {
  label: string;
  value: string;
}

@Component({
  selector: 'app-public-product-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    DecimalPipe,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    ParametricTriggerCardComponent,
  ],
  templateUrl: './public-product-detail.component.html',
  styleUrl: './public-product-detail.component.css',
})
export class PublicProductDetailComponent implements OnInit, OnDestroy {
  readonly product$: Observable<ProductResponse | null>;
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  protected productId = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store,
  ) {
    this.product$ = this.store.select(selectSelectedProduct);
    this.loading$ = this.store.select(selectProductsLoading);
    this.error$ = this.store.select(selectProductsError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearProductsError());
    this.store.dispatch(clearSelectedProduct());

    const productId = Number(
      this.route.snapshot.paramMap.get('productId'),
    );

    if (!Number.isInteger(productId) || productId <= 0) {
      return;
    }

    this.productId = productId;
    this.store.dispatch(loadProduct({ productId }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(clearSelectedProduct());
    this.store.dispatch(clearProductsError());
  }

  protected specRows(product: ProductResponse): SpecRow[] {
    const rows: SpecRow[] = [
      {
        label: 'Minimum sum insured',
        value: `₹ ${product.minimumSumInsured.toLocaleString('en-IN')}`,
      },
      {
        label: 'Maximum sum insured',
        value: `₹ ${product.maximumSumInsured.toLocaleString('en-IN')}`,
      },
      {
        label: 'Policy term',
        value: `${product.minimumTermMonths} - ${product.maximumTermMonths} months`,
      },
      {
        label: 'Coverages',
        value: `${product.coverages.length} included`,
      },
    ];

    if (product.eligibilityDescription) {
      rows.push({
        label: 'Eligibility',
        value: product.eligibilityDescription,
      });
    }

    return rows;
  }

  protected categoryLabel(category: string): string {
    return category.replaceAll('_', ' ');
  }

  protected triggerCondition(product: ProductResponse): TriggerCondition {
    return {
      perilCode: product.perilCode,
      measurementType: product.measurementType,
      measurementUnit: product.measurementUnit,
      thresholdValue: product.thresholdValue,
      comparisonOperator: product.comparisonOperator,
      aggregationType: product.aggregationType,
      observationWindowHours: product.observationWindowHours,
      minimumObservationCount: product.minimumObservationCount,
      triggerDescription: product.triggerDescription,
      humanReadableTrigger: product.humanReadableTrigger,
    };
  }

}