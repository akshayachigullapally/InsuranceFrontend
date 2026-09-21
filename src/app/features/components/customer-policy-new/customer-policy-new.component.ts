import {
  AsyncPipe,
  DecimalPipe,
} from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';
import { Store } from '@ngrx/store';
import {
  Observable,
  Subject,
  combineLatest,
} from 'rxjs';
import {
  distinctUntilChanged,
  map,
  startWith,
  takeUntil,
} from 'rxjs/operators';
import { ProductResponse } from '../../dtos/products/product-response.dto';
import { TriggerCondition } from '../../dtos/triggers/trigger-condition.dto';
import { ZoneResponse } from '../../dtos/zones/zone-response.dto';
import { ZoneService } from '../../services/zone.service';
import {
  clearPoliciesError,
  createPolicy,
} from '../../state/policies/policies.actions';
import {
  selectPoliciesError,
  selectPoliciesSaving,
} from '../../state/policies/policies.selectors';
import {
  clearProductsError,
  loadProducts,
} from '../../state/products/products.actions';
import {
  selectProducts,
  selectProductsError,
  selectProductsLoading,
} from '../../state/products/products.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ParametricTriggerCardComponent } from '../../../shared/components/parametric-trigger-card/parametric-trigger-card.component';

interface PolicyForm {
  productId: FormControl<number | null>;
  sumInsured: FormControl<number | null>;
  termMonths: FormControl<number | null>;
  locationZoneId: FormControl<number | null>;
}

@Component({
  selector: 'app-customer-policy-new',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    DecimalPipe,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    EmptyStateComponent,
    ParametricTriggerCardComponent,
  ],
  templateUrl: './customer-policy-new.component.html',
  styleUrl: './customer-policy-new.component.css',
})
export class CustomerPolicyNewComponent implements OnInit, OnDestroy {
  readonly form = new FormGroup<PolicyForm>({
    productId: new FormControl<number | null>(
      null,
      Validators.required,
    ),
    sumInsured: new FormControl<number | null>(
      null,
      [
        Validators.required,
        Validators.min(1),
      ],
    ),
    termMonths: new FormControl<number | null>(
      null,
      [
        Validators.required,
        Validators.min(1),
      ],
    ),
    locationZoneId: new FormControl<number | null>(
      null,
      [
        Validators.required,
        Validators.min(1),
      ],
    ),
  });

  readonly products$: Observable<ProductResponse[]>;
  readonly productsLoading$: Observable<boolean>;
  readonly productsError$: Observable<string | null>;
  readonly submitting$: Observable<boolean>;
  readonly submitError$: Observable<string | null>;
  readonly premium$: Observable<number>;

  protected selectedProduct: ProductResponse | null = null;
  protected zones: ZoneResponse[] = [];
  protected zonesLoading = false;
  protected zonesError: string | null = null;

  private products: ProductResponse[] = [];
  private requestedProductId: number | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store,
    private readonly zoneService: ZoneService,
  ) {
    this.products$ = this.store.select(selectProducts);
    this.productsLoading$ = this.store.select(selectProductsLoading);
    this.productsError$ = this.store.select(selectProductsError);
    this.submitting$ = this.store.select(selectPoliciesSaving);
    this.submitError$ = this.store.select(selectPoliciesError);

    this.premium$ = combineLatest([
      this.form.controls.sumInsured.valueChanges.pipe(
        startWith(this.form.controls.sumInsured.value),
      ),
      this.form.controls.termMonths.valueChanges.pipe(
        startWith(this.form.controls.termMonths.value),
      ),
    ]).pipe(
      map(([sumInsured, termMonths]) =>
        CustomerPolicyNewComponent.estimatePremium(
          sumInsured,
          termMonths,
        ),
      ),
    );
  }

  static estimatePremium(
    sumInsured: number | null,
    termMonths: number | null,
  ): number {
    if (
      sumInsured === null ||
      sumInsured <= 0 ||
      termMonths === null ||
      termMonths <= 0
    ) {
      return 0;
    }

    return Math.round(
      sumInsured * 0.02 * (termMonths / 12) * 100,
    ) / 100;
  }

  ngOnInit(): void {
    this.store.dispatch(clearProductsError());
    this.store.dispatch(clearPoliciesError());
    this.store.dispatch(loadProducts());

    const queryProductId = Number(
      this.route.snapshot.queryParamMap.get('productId'),
    );

    this.requestedProductId =
      Number.isInteger(queryProductId) && queryProductId > 0
        ? queryProductId
        : null;

    this.products$
      .pipe(takeUntil(this.destroy$))
      .subscribe(products => {
        this.products = products;
        this.selectRequestedProduct();
      });

    this.form.controls.productId.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe(productId => {
        this.updateSelectedProduct(productId);
      });

    this.loadZones();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearPoliciesError());
  }

  protected retryZones(): void {
    this.loadZones();
  }

  protected onSubmit(): void {
    if (
      this.form.invalid ||
      !this.selectedProduct ||
      this.zonesLoading ||
      this.zones.length === 0
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const {
      productId,
      sumInsured,
      termMonths,
      locationZoneId,
    } = this.form.getRawValue();

    if (
      productId === null ||
      sumInsured === null ||
      termMonths === null ||
      locationZoneId === null
    ) {
      this.form.markAllAsTouched();
      return;
    }

    this.store.dispatch(clearPoliciesError());

    this.store.dispatch(createPolicy({
      request: {
        productId,
        sumInsured,
        termMonths,
        locationZoneId,
        perilCode: this.selectedProduct.perilCode || undefined,
        triggerMetric: this.selectedProduct.measurementType || undefined,
        triggerOperator: this.selectedProduct.comparisonOperator || undefined,
        triggerThreshold: this.selectedProduct.thresholdValue ?? undefined,
        triggerDurationHours: this.selectedProduct.observationWindowHours ?? undefined,
        triggerAggregationType: this.selectedProduct.aggregationType || undefined,
        triggerMinObservationCount: this.selectedProduct.minimumObservationCount ?? undefined,
      },
    }));
  }

  protected selectedTrigger(): TriggerCondition {
    const product = this.selectedProduct;

    return {
      perilCode: product?.perilCode || null,
      measurementType: product?.measurementType || 'RAINFALL',
      measurementUnit: product?.measurementUnit || 'MM',
      thresholdValue: product?.thresholdValue ?? 0,
      comparisonOperator: product?.comparisonOperator || 'GREATER_THAN_OR_EQUAL',
      aggregationType: product?.aggregationType || 'AVERAGE',
      observationWindowHours: product?.observationWindowHours ?? 24,
      minimumObservationCount: product?.minimumObservationCount ?? 2,
      triggerDescription: product?.triggerDescription || null,
      humanReadableTrigger: product?.humanReadableTrigger || null,
    };
  }

  private selectRequestedProduct(): void {
    if (
      !this.requestedProductId ||
      this.products.length === 0 ||
      this.form.controls.productId.value
    ) {
      return;
    }

    const product = this.products.find(
      item => item.id === this.requestedProductId,
    );

    if (product) {
      this.form.controls.productId.setValue(product.id);
    }
  }

  private updateSelectedProduct(
    productId: number | null,
  ): void {
    this.selectedProduct =
      this.products.find(product => product.id === productId) ??
      null;

    const sumControl = this.form.controls.sumInsured;
    const termControl = this.form.controls.termMonths;

    if (!this.selectedProduct) {
      sumControl.reset();
      termControl.reset();
      return;
    }

    sumControl.setValidators([
      Validators.required,
      Validators.min(
        this.selectedProduct.minimumSumInsured,
      ),
      Validators.max(
        this.selectedProduct.maximumSumInsured,
      ),
    ]);

    termControl.setValidators([
      Validators.required,
      Validators.min(
        this.selectedProduct.minimumTermMonths,
      ),
      Validators.max(
        this.selectedProduct.maximumTermMonths,
      ),
    ]);

    sumControl.setValue(
      this.selectedProduct.minimumSumInsured,
    );

    termControl.setValue(
      this.selectedProduct.minimumTermMonths,
    );

    sumControl.updateValueAndValidity();
    termControl.updateValueAndValidity();
  }

  private loadZones(): void {
    this.zonesLoading = true;
    this.zonesError = null;
    this.form.controls.locationZoneId.disable();

    this.zoneService
      .getActiveZones()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: zones => {
          this.zones = zones;
          this.zonesLoading = false;
          this.form.controls.locationZoneId.enable();
        },
        error: () => {
          this.zones = [];
          this.zonesLoading = false;
          this.zonesError =
            'Location zones could not be loaded. Please try again.';
          this.form.controls.locationZoneId.disable();
        },
      });
  }
}