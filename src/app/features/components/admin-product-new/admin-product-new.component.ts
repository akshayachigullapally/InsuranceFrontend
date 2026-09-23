import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  PRODUCT_CATEGORIES,
  ProductCategory,
  ProductRequest,
} from '../../dtos/products/product-response.dto';
import {
  clearProductsError,
  createProduct,
  createProductFailure,
  createProductSuccess,
} from '../../state/products/products.actions';
import {
  selectProductsError,
  selectProductsSaving,
} from '../../state/products/products.selectors';
import { ToastService } from '../../../shared/services/toast.service';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import {
  PRODUCT_MEASUREMENT_TYPES,
  TRIGGER_AGGREGATION_TYPES,
  TRIGGER_COMPARISON_OPERATORS,
  TRIGGER_MEASUREMENT_UNITS,
} from '../../dtos/triggers/trigger-condition.dto';

interface CoverageFormValue {
  coverageCode: string;
  name: string;
  description: string;
  coverageLimit: number | null;
  mandatory: boolean;
  active: boolean;
}

interface TriggerFormValue {
  triggerEnabled: boolean;
  perilCode: string;
  measurementType: string;
  measurementUnit: string;
  thresholdValue: number | null;
  comparisonOperator: string;
  aggregationType: string;
  observationWindowHours: number | null;
  minimumObservationCount: number | null;
  triggerDescription: string;
}

interface ProductFormValue {
  productCode: string;
  name: string;
  category: ProductCategory;
  description: string;
  minimumSumInsured: number;
  maximumSumInsured: number;
  minimumTermMonths: number;
  maximumTermMonths: number;
  eligibilityDescription: string;
  trigger: TriggerFormValue;
  coverages: CoverageFormValue[];
}

@Component({
  selector: 'app-admin-product-new',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    RouterLink,
    ErrorMessageComponent,
  ],
  templateUrl: './admin-product-new.component.html',
  styleUrl: './admin-product-new.component.css',
})
export class AdminProductNewComponent implements OnInit, OnDestroy {
  readonly form: FormGroup;
  readonly saving$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  protected readonly categories = PRODUCT_CATEGORIES;
  protected readonly measurementTypes = PRODUCT_MEASUREMENT_TYPES;
  protected readonly measurementUnits = TRIGGER_MEASUREMENT_UNITS;
  protected readonly comparisonOperators = TRIGGER_COMPARISON_OPERATORS;
  protected readonly aggregationTypes = TRIGGER_AGGREGATION_TYPES;
  protected rangeError: string | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private readonly actions$: Actions,
    private readonly toast: ToastService,
  ) {
    this.form = this.fb.group({
      productCode: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
        ],
      ],
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(150),
        ],
      ],
      category: [
        'WEATHER' as ProductCategory,
        Validators.required,
      ],
      description: [''],
      minimumSumInsured: [
        10000,
        [
          Validators.required,
          Validators.min(1),
        ],
      ],
      maximumSumInsured: [
        500000,
        [
          Validators.required,
          Validators.min(1),
        ],
      ],
      minimumTermMonths: [
        1,
        [
          Validators.required,
          Validators.min(1),
        ],
      ],
      maximumTermMonths: [
        12,
        [
          Validators.required,
          Validators.min(1),
        ],
      ],
      eligibilityDescription: [''],
      trigger: this.fb.group({
        triggerEnabled: [true],
        perilCode: [
          'RAINFALL-LOW',
          [
            Validators.required,
            Validators.maxLength(50),
          ],
        ],
        measurementType: [
          'RAINFALL',
          Validators.required,
        ],
        measurementUnit: ['MM', Validators.required],
        thresholdValue: [
          40,
          [
            Validators.required,
            Validators.min(0.01),
          ],
        ],
        comparisonOperator: [
          'GREATER_THAN_OR_EQUAL',
          Validators.required,
        ],
        aggregationType: ['AVERAGE', Validators.required],
        observationWindowHours: [
          24,
          [
            Validators.required,
            Validators.min(1),
            Validators.max(720),
          ],
        ],
        minimumObservationCount: [
          2,
          [
            Validators.required,
            Validators.min(1),
          ],
        ],
        triggerDescription: [''],
      }),
      coverages: this.fb.array([
        this.newCoverageGroup(),
      ]),
    });

    this.saving$ = this.store.select(selectProductsSaving);
    this.error$ = this.store.select(selectProductsError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearProductsError());

    const enabledControl =
      this.trigger.get('triggerEnabled');

    enabledControl?.valueChanges.subscribe(enabled => {
      this.applyTriggerValidation(Boolean(enabled));
    });

    this.applyTriggerValidation(
      Boolean(enabledControl?.value ?? true),
    );

    this.actions$
      .pipe(ofType(createProductSuccess), takeUntil(this.destroy$))
      .subscribe(({ product }) => this.toast.show({
        type: 'success',
        icon: '✅',
        title: 'Product created',
        message: `${product.name} was created successfully.`,
      }));

    this.actions$
      .pipe(ofType(createProductFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => this.toast.show({
        type: 'error',
        icon: '⚠️',
        title: 'Could not create product',
        message: error,
      }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearProductsError());
  }

  protected get coverages(): FormArray {
    return this.form.get('coverages') as FormArray;
  }

  protected get trigger(): FormGroup {
    return this.form.get('trigger') as FormGroup;
  }

  protected triggerConfigured(): boolean {
    return Boolean(this.trigger.get('triggerEnabled')?.value);
  }

  private applyTriggerValidation(enabled: boolean): void {
    const controls = [
      'perilCode',
      'measurementType',
      'measurementUnit',
      'thresholdValue',
      'comparisonOperator',
      'aggregationType',
      'observationWindowHours',
      'minimumObservationCount',
    ];

    for (const name of controls) {
      const control = this.trigger.get(name);
      if (!control) continue;
      if (enabled) {
        control.setValidators([
          Validators.required,
          ...this.boundedValidators(name),
        ]);
      } else {
        control.clearValidators();
      }
      control.updateValueAndValidity();
    }
  }

  private boundedValidators(name: string): ValidatorFn[] {
    switch (name) {
      case 'thresholdValue':
        return [Validators.min(0.01)];
      case 'observationWindowHours':
        return [Validators.min(1), Validators.max(720)];
      case 'minimumObservationCount':
        return [Validators.min(1)];
      case 'perilCode':
        return [Validators.maxLength(50)];
      case 'triggerDescription':
        return [Validators.maxLength(1000)];
      default:
        return [];
    }
  }

  protected newCoverageGroup(): FormGroup {
    return this.fb.group({
      coverageCode: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
        ],
      ],
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(150),
        ],
      ],
      description: [''],
      coverageLimit: [
        null,
        Validators.min(0),
      ],
      mandatory: [false],
      active: [true],
    });
  }

  protected addCoverage(): void {
    this.coverages.push(this.newCoverageGroup());
  }

  protected removeCoverage(index: number): void {
    if (this.coverages.length <= 1) {
      return;
    }

    this.coverages.removeAt(index);
  }

  protected onSubmit(): void {
    this.rangeError = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue() as ProductFormValue;

    if (raw.minimumSumInsured > raw.maximumSumInsured) {
      this.rangeError =
        'Minimum sum insured cannot exceed maximum sum insured.';
      return;
    }

    if (raw.minimumTermMonths > raw.maximumTermMonths) {
      this.rangeError =
        'Minimum policy term cannot exceed maximum policy term.';
      return;
    }

    const duplicateCoverageCode =
      this.findDuplicateCoverageCode(raw.coverages);

    if (duplicateCoverageCode) {
      this.rangeError =
        `Duplicate coverage code: ${duplicateCoverageCode}`;
      return;
    }

    const request = this.buildRequest(raw);

    this.store.dispatch(clearProductsError());
    this.store.dispatch(createProduct({ request }));
  }

  private buildRequest(
    raw: ProductFormValue,
  ): ProductRequest {
    return {
      productCode: raw.productCode.trim().toUpperCase(),
      name: raw.name.trim(),
      category: raw.category,
      description: raw.description.trim() || undefined,
      minimumSumInsured: Number(raw.minimumSumInsured),
      maximumSumInsured: Number(raw.maximumSumInsured),
      minimumTermMonths: Number(raw.minimumTermMonths),
      maximumTermMonths: Number(raw.maximumTermMonths),
      eligibilityDescription:
        raw.eligibilityDescription.trim() || undefined,
      ...this.buildTriggerRequest(raw.trigger),
      coverages: raw.coverages.map(coverage => ({
        coverageCode:
          coverage.coverageCode.trim().toUpperCase(),
        name: coverage.name.trim(),
        description:
          coverage.description.trim() || undefined,
        coverageLimit:
          coverage.coverageLimit === null
            ? undefined
            : Number(coverage.coverageLimit),
        mandatory: coverage.mandatory,
        active: coverage.active,
      })),
    };
  }

  private buildTriggerRequest(
    trigger: TriggerFormValue,
  ): Partial<ProductRequest> {
    if (!trigger.triggerEnabled) {
      return {};
    }

    const request: Partial<ProductRequest> = {
      perilCode: trigger.perilCode.trim(),
      measurementType: trigger.measurementType,
      measurementUnit: trigger.measurementUnit,
      thresholdValue: Number(trigger.thresholdValue),
      comparisonOperator: trigger.comparisonOperator,
      aggregationType: trigger.aggregationType,
      observationWindowHours: Number(trigger.observationWindowHours),
      minimumObservationCount: Number(trigger.minimumObservationCount),
    };

    if (trigger.triggerDescription.trim()) {
      request.triggerDescription = trigger.triggerDescription.trim();
    }

    return request;
  }

  private findDuplicateCoverageCode(
    coverages: CoverageFormValue[],
  ): string | null {
    const codes = new Set<string>();

    for (const coverage of coverages) {
      const code = coverage.coverageCode
        .trim()
        .toUpperCase();

      if (codes.has(code)) {
        return code;
      }

      codes.add(code);
    }

    return null;
  }
}