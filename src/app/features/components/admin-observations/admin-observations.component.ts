import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
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
  CreateObservationRequest,
  MEASUREMENT_TYPES,
  MEASUREMENT_UNITS,
  MeasurementType,
  MeasurementUnit,
  OBSERVATION_SOURCES,
  ObservationResponse,
  ObservationSource,
} from '../../dtos/observations/observation-response.dto';
import {
  clearObservationsError,
  createObservation,
  loadObservations,
  setObservationsSearch,
} from '../../state/observations/observations.actions';
import {
  selectFilteredObservations,
  selectObservationsError,
  selectObservationsLoading,
  selectObservationsSaving,
} from '../../state/observations/observations.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface ObservationForm {
  locationZoneId: FormControl<number | null>;
  measurementType: FormControl<MeasurementType | ''>;
  measurementUnit: FormControl<MeasurementUnit | ''>;
  observedValue: FormControl<number | null>;
  observedAt: FormControl<string>;
  source: FormControl<ObservationSource | ''>;
  sourceReference: FormControl<string>;
}

@Component({
  selector: 'app-admin-observations',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './admin-observations.component.html',
  styleUrl: './admin-observations.component.css',
})
export class AdminObservationsComponent implements OnInit, OnDestroy {
  readonly observations$: Observable<ObservationResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly saving$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  readonly searchControl = new FormControl('', { nonNullable: true });

  readonly form = new FormGroup<ObservationForm>({
    locationZoneId: new FormControl<number | null>(null, [
      Validators.required,
    ]),
    measurementType: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    measurementUnit: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    observedValue: new FormControl<number | null>(null, [
      Validators.required,
    ]),
    observedAt: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    source: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    sourceReference: new FormControl('', { nonNullable: true }),
  });

  protected readonly measurementTypes = MEASUREMENT_TYPES;
  protected readonly measurementUnits = MEASUREMENT_UNITS;
  protected readonly sources = OBSERVATION_SOURCES;
  protected formOpen = false;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store) {
    this.observations$ = this.store.select(selectFilteredObservations);
    this.loading$ = this.store.select(selectObservationsLoading);
    this.saving$ = this.store.select(selectObservationsSaving);
    this.error$ = this.store.select(selectObservationsError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearObservationsError());
    this.store.dispatch(loadObservations());

    this.searchControl.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(search => {
      this.store.dispatch(setObservationsSearch({ search }));
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearObservationsError());
  }

  protected clearFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.store.dispatch(loadObservations());
  }

  protected openCreate(): void {
    this.store.dispatch(clearObservationsError());
    this.form.reset({
      locationZoneId: null,
      measurementType: '',
      measurementUnit: '',
      observedValue: null,
      observedAt: '',
      source: '',
      sourceReference: '',
    });
    this.formOpen = true;
  }

  protected closeForm(): void {
    this.formOpen = false;
    this.form.reset();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (
      raw.locationZoneId === null ||
      raw.observedValue === null ||
      !raw.measurementType ||
      !raw.measurementUnit ||
      !raw.source
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const request: CreateObservationRequest = {
      locationZoneId: raw.locationZoneId,
      measurementType: raw.measurementType as MeasurementType,
      measurementUnit: raw.measurementUnit as MeasurementUnit,
      observedValue: Number(raw.observedValue),
      observedAt: raw.observedAt,
      source: raw.source as ObservationSource,
      sourceReference: raw.sourceReference.trim() || undefined,
    };

    this.store.dispatch(createObservation({ request }));
    this.formOpen = false;
  }
}
