import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {
  AGGREGATION_TYPES,
  COMPARISON_OPERATORS,
  MEASUREMENT_TYPES,
  MEASUREMENT_UNITS,
  TRIGGER_DEFINITION_MANAGEABLE_STATUSES,
  TriggerDefinitionManageableStatus,
  TriggerDefinitionRequest,
  TriggerDefinitionResponse,
} from '../../dtos/trigger-definitions/trigger-definition-response.dto';
import {
  archiveTriggerDefinition,
  clearSelectedTriggerDefinition,
  clearTriggerDefinitionFilters,
  clearTriggerDefinitionsError,
  createTriggerDefinition,
  evaluateTriggerDefinition,
  loadTriggerDefinitions,
  setTriggerDefinitionsSearch,
  updateTriggerDefinition,
  updateTriggerDefinitionStatus,
} from '../../state/trigger-definitions/trigger-definitions.actions';
import {
  selectFilteredTriggerDefinitions,
  selectTriggerDefinitionsEvaluating,
  selectTriggerDefinitionsError,
  selectTriggerDefinitionsLoading,
  selectTriggerDefinitionsSaving,
  selectUpdatingTriggerDefinitionId,
} from '../../state/trigger-definitions/trigger-definitions.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface DefinitionForm {
  definitionCode: FormControl<string>;
  definitionName: FormControl<string>;
  description: FormControl<string>;
  perilId: FormControl<number | null>;
  locationZoneId: FormControl<number | null>;
  productId: FormControl<number | null>;
  measurementType: FormControl<string>;
  measurementUnit: FormControl<string>;
  aggregationType: FormControl<string>;
  comparisonOperator: FormControl<string>;
  thresholdValue: FormControl<number | null>;
  observationWindowHours: FormControl<number | null>;
  minimumObservationCount: FormControl<number | null>;
  effectiveFrom: FormControl<string>;
  effectiveTo: FormControl<string>;
}

@Component({
  selector: 'app-admin-trigger-definitions',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './admin-trigger-definitions.component.html',
  styleUrl: './admin-trigger-definitions.component.css',
})
export class AdminTriggerDefinitionsComponent implements OnInit, OnDestroy {
  readonly definitions$: Observable<TriggerDefinitionResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly saving$: Observable<boolean>;
  readonly evaluating$: Observable<boolean>;
  readonly updatingDefinitionId$: Observable<number | null>;
  readonly error$: Observable<string | null>;

  readonly searchControl = new FormControl('', { nonNullable: true });

  readonly form = new FormGroup<DefinitionForm>({
    definitionCode: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    definitionName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
    perilId: new FormControl<number | null>(null, [Validators.required]),
    locationZoneId: new FormControl<number | null>(null, [Validators.required]),
    productId: new FormControl<number | null>(null, [Validators.required]),
    measurementType: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    measurementUnit: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    aggregationType: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    comparisonOperator: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    thresholdValue: new FormControl<number | null>(null, [Validators.required]),
    observationWindowHours: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),
    minimumObservationCount: new FormControl<number | null>(1, [
      Validators.required,
      Validators.min(1),
    ]),
    effectiveFrom: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    effectiveTo: new FormControl('', { nonNullable: true }),
  });

  protected readonly statuses = TRIGGER_DEFINITION_MANAGEABLE_STATUSES;
  protected readonly measurementTypes = MEASUREMENT_TYPES;
  protected readonly measurementUnits = MEASUREMENT_UNITS;
  protected readonly aggregationTypes = AGGREGATION_TYPES;
  protected readonly comparisonOperators = COMPARISON_OPERATORS;
  protected formOpen = false;
  protected editingDefinition: TriggerDefinitionResponse | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store) {
    this.definitions$ = this.store.select(selectFilteredTriggerDefinitions);
    this.loading$ = this.store.select(selectTriggerDefinitionsLoading);
    this.saving$ = this.store.select(selectTriggerDefinitionsSaving);
    this.evaluating$ = this.store.select(selectTriggerDefinitionsEvaluating);
    this.updatingDefinitionId$ = this.store.select(selectUpdatingTriggerDefinitionId);
    this.error$ = this.store.select(selectTriggerDefinitionsError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearTriggerDefinitionsError());
    this.store.dispatch(loadTriggerDefinitions());

    this.searchControl.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(search => {
      this.store.dispatch(setTriggerDefinitionsSearch({ search }));
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearSelectedTriggerDefinition());
    this.store.dispatch(clearTriggerDefinitionsError());
  }

  protected clearFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.store.dispatch(clearTriggerDefinitionFilters());
    this.store.dispatch(loadTriggerDefinitions());
  }

  protected openCreate(): void {
    this.store.dispatch(clearTriggerDefinitionsError());
    this.editingDefinition = null;
    this.form.reset({
      definitionCode: '',
      definitionName: '',
      description: '',
      perilId: null,
      locationZoneId: null,
      productId: null,
      measurementType: '',
      measurementUnit: '',
      aggregationType: '',
      comparisonOperator: '',
      thresholdValue: null,
      observationWindowHours: null,
      minimumObservationCount: 1,
      effectiveFrom: '',
      effectiveTo: '',
    });
    this.formOpen = true;
  }

  protected openEdit(def: TriggerDefinitionResponse): void {
    this.store.dispatch(clearTriggerDefinitionsError());
    this.editingDefinition = def;
    this.form.reset({
      definitionCode: def.definitionCode,
      definitionName: def.definitionName,
      description: def.description,
      perilId: def.perilId,
      locationZoneId: def.locationZoneId,
      productId: def.productId,
      measurementType: def.measurementType,
      measurementUnit: def.measurementUnit,
      aggregationType: def.aggregationType,
      comparisonOperator: def.comparisonOperator,
      thresholdValue: def.thresholdValue,
      observationWindowHours: def.observationWindowHours,
      minimumObservationCount: def.minimumObservationCount,
      effectiveFrom: def.effectiveFrom?.split('T')[0] ?? '',
      effectiveTo: def.effectiveTo?.split('T')[0] ?? '',
    });
    this.formOpen = true;
  }

  protected closeForm(): void {
    this.formOpen = false;
    this.editingDefinition = null;
    this.form.reset();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (
      raw.perilId === null ||
      raw.locationZoneId === null ||
      raw.productId === null ||
      raw.thresholdValue === null ||
      raw.observationWindowHours === null ||
      raw.minimumObservationCount === null
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const request: TriggerDefinitionRequest = {
      definitionCode: raw.definitionCode.trim(),
      definitionName: raw.definitionName.trim(),
      description: raw.description.trim(),
      perilId: raw.perilId,
      locationZoneId: raw.locationZoneId,
      productId: raw.productId,
      measurementType: raw.measurementType as TriggerDefinitionRequest['measurementType'],
      measurementUnit: raw.measurementUnit as TriggerDefinitionRequest['measurementUnit'],
      aggregationType: raw.aggregationType as TriggerDefinitionRequest['aggregationType'],
      comparisonOperator: raw.comparisonOperator as TriggerDefinitionRequest['comparisonOperator'],
      thresholdValue: Number(raw.thresholdValue),
      observationWindowHours: Number(raw.observationWindowHours),
      minimumObservationCount: Number(raw.minimumObservationCount),
      effectiveFrom: raw.effectiveFrom,
      effectiveTo: raw.effectiveTo || undefined,
    };

    if (this.editingDefinition) {
      this.store.dispatch(updateTriggerDefinition({
        definitionId: this.editingDefinition.id,
        request,
      }));
    } else {
      this.store.dispatch(createTriggerDefinition({ request }));
    }

    this.formOpen = false;
    this.editingDefinition = null;
  }

  protected changeStatus(def: TriggerDefinitionResponse, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const status = select.value as TriggerDefinitionManageableStatus;

    if (status === def.status) return;

    this.store.dispatch(updateTriggerDefinitionStatus({
      definitionId: def.id,
      status,
    }));
  }

  protected evaluate(def: TriggerDefinitionResponse): void {
    const confirmed = window.confirm(
      `Evaluate "${def.definitionName}"? This will check observations against the threshold.`,
    );

    if (confirmed) {
      this.store.dispatch(evaluateTriggerDefinition({ definitionId: def.id }));
    }
  }

  protected archive(def: TriggerDefinitionResponse): void {
    const confirmed = window.confirm(
      `Archive "${def.definitionName}"? Archived definitions cannot be retrieved through the normal endpoints.`,
    );

    if (confirmed) {
      this.store.dispatch(archiveTriggerDefinition({ definitionId: def.id }));
    }
  }

  protected isUpdating(
    definitionId: number,
    updatingId: number | null,
  ): boolean {
    return definitionId === updatingId;
  }
}
