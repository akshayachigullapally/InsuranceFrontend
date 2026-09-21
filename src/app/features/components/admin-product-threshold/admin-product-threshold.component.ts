import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ProductResponse } from '../../dtos/products/product-response.dto';
import {
  PRODUCT_MEASUREMENT_TYPES,
  ProductTriggerSyncResponse,
  ProductTriggerThresholdHistoryResponse,
  ProductTriggerThresholdUpdateRequest,
  ProductTriggerThresholdUpdateResponse,
  TRIGGER_AGGREGATION_TYPES,
  TRIGGER_COMPARISON_OPERATORS,
  TRIGGER_MEASUREMENT_UNITS,
  TriggerCondition,
} from '../../dtos/triggers/trigger-condition.dto';
import {
  clearProductThresholdUpdate,
  clearProductTriggerSync,
  clearProductsError,
  clearSelectedProduct,
  loadAdminProduct,
  loadProductThresholdHistory,
  syncProductTrigger,
  updateProductThreshold,
} from '../../state/products/products.actions';
import {
  selectProductThresholdHistory,
  selectProductThresholdUpdate,
  selectProductTriggerSync,
  selectProductsError,
  selectProductsLoading,
  selectProductsSaving,
  selectProductsSyncingTrigger,
  selectSelectedProduct,
} from '../../state/products/products.selectors';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ParametricTriggerCardComponent } from '../../../shared/components/parametric-trigger-card/parametric-trigger-card.component';
import { triggerSyncStatusLabel } from '../../utils/trigger-display';

@Component({
  selector: 'app-admin-product-threshold',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    EmptyStateComponent,
    ParametricTriggerCardComponent,
  ],
  templateUrl: './admin-product-threshold.component.html',
  styleUrl: './admin-product-threshold.component.css',
})
export class AdminProductThresholdComponent implements OnInit, OnDestroy {
  readonly product$: Observable<ProductResponse | null>;
  readonly loading$: Observable<boolean>;
  readonly saving$: Observable<boolean>;
  readonly syncing$: Observable<boolean>;
  readonly error$: Observable<string | null>;
  readonly history$: Observable<ProductTriggerThresholdHistoryResponse[]>;
  readonly updateResult$: Observable<ProductTriggerThresholdUpdateResponse | null>;
  readonly syncResult$: Observable<ProductTriggerSyncResponse | null>;

  readonly form: FormGroup;

  protected readonly measurementTypes = PRODUCT_MEASUREMENT_TYPES;
  protected readonly measurementUnits = TRIGGER_MEASUREMENT_UNITS;
  protected readonly comparisonOperators = TRIGGER_COMPARISON_OPERATORS;
  protected readonly aggregationTypes = TRIGGER_AGGREGATION_TYPES;

  protected productId = 0;
  protected invalidProductId = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private readonly route: ActivatedRoute,
  ) {
    this.product$ = this.store.select(selectSelectedProduct);
    this.loading$ = this.store.select(selectProductsLoading);
    this.saving$ = this.store.select(selectProductsSaving);
    this.syncing$ = this.store.select(selectProductsSyncingTrigger);
    this.error$ = this.store.select(selectProductsError);
    this.history$ = this.store.select(selectProductThresholdHistory);
    this.updateResult$ = this.store.select(selectProductThresholdUpdate);
    this.syncResult$ = this.store.select(selectProductTriggerSync);

    // Keep a minimal form for admins to update only the threshold value.
    this.form = this.fb.group({
      thresholdValue: [
        null,
        [Validators.required, Validators.min(0.01)],
      ],
      // Keep other controls in the form group for backwards compatibility
      // with patching but hide them in the UI. They will not be editable here.
      perilCode: [''],
      measurementType: ['RAINFALL'],
      measurementUnit: ['MM'],
      comparisonOperator: ['GREATER_THAN_OR_EQUAL'],
      aggregationType: ['AVERAGE'],
      observationWindowHours: [24],
      minimumObservationCount: [2],
      triggerDescription: [''],
      changeReason: [''],
    });
  }

  ngOnInit(): void {
    this.store.dispatch(clearProductsError());
    this.store.dispatch(clearProductThresholdUpdate());
    this.store.dispatch(clearProductTriggerSync());
    this.store.dispatch(clearSelectedProduct());

    const productId = Number(
      this.route.snapshot.paramMap.get('productId'),
    );

    if (!Number.isInteger(productId) || productId <= 0) {
      this.invalidProductId = true;
      return;
    }

    this.productId = productId;
    this.store.dispatch(loadAdminProduct({ productId }));
    this.store.dispatch(loadProductThresholdHistory({ productId }));

    this.store
      .select(selectSelectedProduct)
      .subscribe(product => {
        if (!product || product.id !== productId) return;
        this.patchForm(product);
      });
  }

  ngOnDestroy(): void {
    this.store.dispatch(clearSelectedProduct());
    this.store.dispatch(clearProductsError());
    this.store.dispatch(clearProductThresholdUpdate());
    this.store.dispatch(clearProductTriggerSync());
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

  protected syncLabel(status: string | null | undefined): string {
    return triggerSyncStatusLabel(status);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Build a minimal request: only update the threshold value while preserving
    // other product attributes server-side. Backend should accept missing fields.
    const raw = this.form.getRawValue();
    const request: ProductTriggerThresholdUpdateRequest = {
      perilCode: (raw.perilCode || '').trim(),
      measurementType: raw.measurementType,
      measurementUnit: raw.measurementUnit,
      thresholdValue: Number(raw.thresholdValue),
      comparisonOperator: raw.comparisonOperator,
      aggregationType: raw.aggregationType,
      observationWindowHours: Number(raw.observationWindowHours),
      minimumObservationCount: Number(raw.minimumObservationCount),
      triggerDescription: raw.triggerDescription?.trim() || undefined,
      changeReason: raw.changeReason?.trim() || undefined,
    };

    this.store.dispatch(clearProductsError());
    this.store.dispatch(updateProductThreshold({ productId: this.productId, request }));
  }

  protected onSync(): void {
    this.store.dispatch(clearProductsError());
    this.store.dispatch(syncProductTrigger({
      productId: this.productId,
    }));
  }

  private patchForm(product: ProductResponse): void {
    this.form.patchValue({
      perilCode: product.perilCode ?? '',
      measurementType: product.measurementType ?? 'RAINFALL',
      measurementUnit: product.measurementUnit ?? 'MM',
      thresholdValue: product.thresholdValue ?? null,
      comparisonOperator:
        product.comparisonOperator ?? 'GREATER_THAN_OR_EQUAL',
      aggregationType: product.aggregationType ?? 'AVERAGE',
      observationWindowHours: product.observationWindowHours ?? 24,
      minimumObservationCount: product.minimumObservationCount ?? 2,
      triggerDescription: product.triggerDescription ?? '',
      changeReason: '',
    });
  }
}