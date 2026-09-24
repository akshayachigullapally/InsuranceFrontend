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
import {
  PRODUCT_CATEGORIES,
  ProductCategory,
  ProductResponse,
} from '../../dtos/products/product-response.dto';
import {
  PRODUCT_MEASUREMENT_TYPES,
  TRIGGER_AGGREGATION_TYPES,
  TRIGGER_COMPARISON_OPERATORS,
  TRIGGER_MEASUREMENT_UNITS,
  TriggerCondition,
} from '../../dtos/triggers/trigger-condition.dto';
import { ZoneResponse } from '../../dtos/zones/zone-response.dto';
import { ZoneService } from '../../services/zone.service';
import {
  clearPoliciesError,
  createCustomPolicy,
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

interface CustomPolicyForm {
  name: FormControl<string>;
  description: FormControl<string>;
  category: FormControl<ProductCategory>;
  otherCategoryDetail: FormControl<string>;
  sumInsured: FormControl<number | null>;
  termMonths: FormControl<number | null>;
  locationZoneId: FormControl<number | null>;
  perilCode: FormControl<string>;
  otherPerilDetail: FormControl<string>;
  measurementType: FormControl<string>;
  otherMeasurementTypeDetail: FormControl<string>;
  measurementUnit: FormControl<string>;
  otherMeasurementUnitDetail: FormControl<string>;
  thresholdValue: FormControl<number | null>;
  comparisonOperator: FormControl<string>;
  aggregationType: FormControl<string>;
  observationWindowHours: FormControl<number | null>;
  minimumObservationCount: FormControl<number | null>;
  triggerDescription: FormControl<string>;
}

const OTHER_VALUE = 'OTHER';

export const CUSTOM_PERILS = [
  { value: 'EXCESS_RAINFALL', label: 'Excess Rainfall', measurementType: 'RAINFALL', measurementUnit: 'MM' },
  { value: 'DROUGHT', label: 'Drought', measurementType: 'SOIL_MOISTURE', measurementUnit: 'PERCENTAGE' },
  { value: 'FLOOD', label: 'Flood', measurementType: 'WATER_LEVEL', measurementUnit: 'METER' },
  { value: 'EXTREME_TEMPERATURE', label: 'Extreme Temperature', measurementType: 'TEMPERATURE', measurementUnit: 'CELSIUS' },
  { value: 'HIGH_WIND', label: 'High Wind', measurementType: 'WIND_SPEED', measurementUnit: 'KM_PER_HOUR' },
  { value: 'CYCLONE', label: 'Cyclone', measurementType: 'WIND_SPEED', measurementUnit: 'KM_PER_HOUR' },
  { value: 'OTHER', label: 'Other', measurementType: null, measurementUnit: null },
] as const;

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

  readonly customForm = new FormGroup<CustomPolicyForm>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(150)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(1000)],
    }),
    category: new FormControl<ProductCategory>('OTHER', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    otherCategoryDetail: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(150)],
    }),
    sumInsured: new FormControl<number | null>(
      null,
      [Validators.required, Validators.min(1)],
    ),
    termMonths: new FormControl<number | null>(
      null,
      [Validators.required, Validators.min(1)],
    ),
    locationZoneId: new FormControl<number | null>(
      null,
      [Validators.required, Validators.min(1)],
    ),
    perilCode: new FormControl('EXCESS_RAINFALL', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    otherPerilDetail: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(150)],
    }),
    measurementType: new FormControl('RAINFALL', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    otherMeasurementTypeDetail: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(150)],
    }),
    measurementUnit: new FormControl('MM', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    otherMeasurementUnitDetail: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(150)],
    }),
    thresholdValue: new FormControl<number | null>(
      null,
      [Validators.required, Validators.min(0.01)],
    ),
    comparisonOperator: new FormControl('GREATER_THAN_OR_EQUAL', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    aggregationType: new FormControl('AVERAGE', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    observationWindowHours: new FormControl<number | null>(
      24,
      [Validators.required, Validators.min(1), Validators.max(720)],
    ),
    minimumObservationCount: new FormControl<number | null>(
      2,
      [Validators.required, Validators.min(1)],
    ),
    triggerDescription: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(1000)],
    }),
  });

  protected readonly perils = CUSTOM_PERILS;
  protected readonly categories = PRODUCT_CATEGORIES;
  protected readonly measurementTypes = PRODUCT_MEASUREMENT_TYPES;
  protected readonly measurementUnits = TRIGGER_MEASUREMENT_UNITS;
  protected readonly comparisonOperators = TRIGGER_COMPARISON_OPERATORS;
  protected readonly aggregationTypes = TRIGGER_AGGREGATION_TYPES;
  protected mode: 'PRODUCT' | 'CUSTOM' = 'PRODUCT';

  readonly products$: Observable<ProductResponse[]>;
  readonly productsLoading$: Observable<boolean>;
  readonly productsError$: Observable<string | null>;
  readonly submitting$: Observable<boolean>;
  readonly submitError$: Observable<string | null>;
  readonly premium$: Observable<number>;
  readonly customPremium$: Observable<number>;

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

    this.customPremium$ = combineLatest([
      this.customForm.controls.sumInsured.valueChanges.pipe(
        startWith(this.customForm.controls.sumInsured.value),
      ),
      this.customForm.controls.termMonths.valueChanges.pipe(
        startWith(this.customForm.controls.termMonths.value),
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

    this.customForm.controls.perilCode.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe(perilCode => {
        this.applyPerilDefaults(perilCode);
      });

    this.watchOtherDetail(
      this.customForm.controls.category,
      this.customForm.controls.otherCategoryDetail,
    );
    this.watchOtherDetail(
      this.customForm.controls.perilCode,
      this.customForm.controls.otherPerilDetail,
    );
    this.watchOtherDetail(
      this.customForm.controls.measurementType,
      this.customForm.controls.otherMeasurementTypeDetail,
    );
    this.watchOtherDetail(
      this.customForm.controls.measurementUnit,
      this.customForm.controls.otherMeasurementUnitDetail,
    );

    this.loadZones();
  }

  protected setMode(mode: 'PRODUCT' | 'CUSTOM'): void {
    this.mode = mode;
    this.store.dispatch(clearPoliciesError());
  }

  protected isOtherSelected(value: string | null): boolean {
    return value === OTHER_VALUE;
  }

  private watchOtherDetail<T extends string>(
    selectControl: FormControl<T>,
    detailControl: FormControl<string>,
  ): void {
    const sync = (value: string): void => {
      if (value === OTHER_VALUE) {
        detailControl.setValidators([
          Validators.required,
          Validators.maxLength(150),
        ]);
      } else {
        detailControl.setValidators([Validators.maxLength(150)]);
        detailControl.setValue('');
      }
      detailControl.updateValueAndValidity();
    };

    sync(selectControl.value);

    selectControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe(sync);
  }

  protected customTrigger(): TriggerCondition {
    const raw = this.customForm.getRawValue();

    return {
      perilCode: raw.perilCode || null,
      measurementType: raw.measurementType || 'RAINFALL',
      measurementUnit: raw.measurementUnit || 'MM',
      thresholdValue: raw.thresholdValue ?? 0,
      comparisonOperator: raw.comparisonOperator || 'GREATER_THAN_OR_EQUAL',
      aggregationType: raw.aggregationType || 'AVERAGE',
      observationWindowHours: raw.observationWindowHours ?? 24,
      minimumObservationCount: raw.minimumObservationCount ?? 2,
      triggerDescription: raw.triggerDescription || null,
      humanReadableTrigger: null,
    };
  }

  protected perilLocksMeasurement(perilCode: string): boolean {
    const peril = this.perils.find(item => item.value === perilCode);
    return !!peril?.measurementType;
  }

  private applyPerilDefaults(perilCode: string): void {
    const peril = this.perils.find(item => item.value === perilCode);

    if (!peril?.measurementType || !peril.measurementUnit) {
      return;
    }

    this.customForm.controls.measurementType.setValue(peril.measurementType);
    this.customForm.controls.measurementUnit.setValue(peril.measurementUnit);
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

  protected onSubmitCustom(): void {
    if (
      this.customForm.invalid ||
      this.zonesLoading ||
      this.zones.length === 0
    ) {
      this.customForm.markAllAsTouched();
      return;
    }

    const raw = this.customForm.getRawValue();

    if (
      raw.sumInsured === null ||
      raw.termMonths === null ||
      raw.locationZoneId === null ||
      raw.thresholdValue === null ||
      raw.observationWindowHours === null ||
      raw.minimumObservationCount === null
    ) {
      this.customForm.markAllAsTouched();
      return;
    }

    this.store.dispatch(clearPoliciesError());

    const description = CustomerPolicyNewComponent.appendOtherDetail(
      raw.description,
      raw.category === OTHER_VALUE ? raw.otherCategoryDetail : '',
      'Category',
    );

    const triggerDescription = [
      CustomerPolicyNewComponent.appendOtherDetail(
        '',
        raw.perilCode === OTHER_VALUE ? raw.otherPerilDetail : '',
        'Peril',
      ),
      CustomerPolicyNewComponent.appendOtherDetail(
        '',
        raw.measurementType === OTHER_VALUE ? raw.otherMeasurementTypeDetail : '',
        'Measurement type',
      ),
      CustomerPolicyNewComponent.appendOtherDetail(
        '',
        raw.measurementUnit === OTHER_VALUE ? raw.otherMeasurementUnitDetail : '',
        'Measurement unit',
      ),
      raw.triggerDescription.trim(),
    ]
      .filter(part => part.length > 0)
      .join(' | ');

    this.store.dispatch(createCustomPolicy({
      request: {
        name: raw.name.trim() || undefined,
        description: description || undefined,
        category: raw.category,
        sumInsured: raw.sumInsured,
        termMonths: raw.termMonths,
        locationZoneId: raw.locationZoneId,
        perilCode: raw.perilCode,
        measurementType: raw.measurementType,
        measurementUnit: raw.measurementUnit,
        thresholdValue: raw.thresholdValue,
        comparisonOperator: raw.comparisonOperator,
        aggregationType: raw.aggregationType,
        observationWindowHours: raw.observationWindowHours,
        minimumObservationCount: raw.minimumObservationCount,
        triggerDescription: triggerDescription || undefined,
      },
    }));
  }

  private static appendOtherDetail(
    base: string,
    otherDetail: string,
    label: string,
  ): string {
    const trimmedBase = base.trim();
    const trimmedDetail = otherDetail.trim();

    if (!trimmedDetail) {
      return trimmedBase;
    }

    const note = `${label} (Other): ${trimmedDetail}`;
    return trimmedBase ? `${trimmedBase} | ${note}` : note;
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
    this.customForm.controls.locationZoneId.disable();

    this.zoneService
      .getActiveZones()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: zones => {
          this.zones = zones;
          this.zonesLoading = false;
          this.form.controls.locationZoneId.enable();
          this.customForm.controls.locationZoneId.enable();
        },
        error: () => {
          this.zones = [];
          this.zonesLoading = false;
          this.zonesError =
            'Location zones could not be loaded. Please try again.';
          this.form.controls.locationZoneId.disable();
          this.customForm.controls.locationZoneId.disable();
        },
      });
  }
}