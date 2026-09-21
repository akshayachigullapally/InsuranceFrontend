import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ProductResponse } from '../../dtos/products/product-response.dto';
import {
  clearProductsError,
  loadAdminProducts,
} from '../../state/products/products.actions';
import {
  selectAdminProducts,
  selectProductsError,
  selectProductsLoading,
} from '../../state/products/products.selectors';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ParametricTriggerCardComponent } from '../../../shared/components/parametric-trigger-card/parametric-trigger-card.component';
import { TriggerCondition } from '../../dtos/triggers/trigger-condition.dto';
import {
  triggerSyncStatusColor,
  triggerSyncStatusLabel,
} from '../../utils/trigger-display';

@Component({
  selector: 'app-admin-product-thresholds',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    EmptyStateComponent,
    ParametricTriggerCardComponent,
  ],
  templateUrl: './admin-product-thresholds.component.html',
  styleUrl: './admin-product-thresholds.component.css',
})
export class AdminProductThresholdsComponent implements OnInit {
  readonly products$: Observable<ProductResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  constructor(private readonly store: Store) {
    this.products$ = this.store.select(selectAdminProducts);
    this.loading$ = this.store.select(selectProductsLoading);
    this.error$ = this.store.select(selectProductsError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearProductsError());
    this.store.dispatch(loadAdminProducts());
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

  protected syncColor(status: string | null | undefined): string {
    return triggerSyncStatusColor(status);
  }

  protected syncLabel(status: string | null | undefined): string {
    return triggerSyncStatusLabel(status);
  }
}