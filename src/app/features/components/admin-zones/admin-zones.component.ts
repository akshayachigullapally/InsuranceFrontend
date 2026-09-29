import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {
  ZONE_MANAGEABLE_STATUSES,
  ZoneManageableStatus,
  ZoneRequest,
  ZoneResponse,
} from '../../dtos/zones/zone-response.dto';
import {
  archiveZone,
  clearSelectedZone,
  clearZoneFilters,
  clearZonesError,
  createZone,
  loadZones,
  setZonesSearch,
  updateZone,
  updateZoneAlert,
  updateZoneExposureCap,
  updateZoneStatus,
} from '../../state/zones/zones.actions';
import {
  selectDistinctStates,
  selectFilteredZones,
  selectUpdatingZoneId,
  selectZonesError,
  selectZonesLoading,
  selectZonesSaving,
} from '../../state/zones/zones.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface ZoneForm {
  zoneCode: FormControl<string>;
  zoneName: FormControl<string>;
  country: FormControl<string>;
  state: FormControl<string>;
  district: FormControl<string>;
  postalCode: FormControl<string>;
  latitude: FormControl<number | null>;
  longitude: FormControl<number | null>;
  radiusKm: FormControl<number | null>;
}

@Component({
  selector: 'app-admin-zones',
  standalone: true,
  imports: [
    AsyncPipe,
    DecimalPipe,
    ReactiveFormsModule,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './admin-zones.component.html',
  styleUrl: './admin-zones.component.css',
})
export class AdminZonesComponent implements OnInit, OnDestroy {
  readonly zones$: Observable<ZoneResponse[]>;
  readonly states$: Observable<string[]>;
  readonly loading$: Observable<boolean>;
  readonly saving$: Observable<boolean>;
  readonly updatingZoneId$: Observable<number | null>;
  readonly error$: Observable<string | null>;

  readonly searchControl = new FormControl('', { nonNullable: true });

  readonly form = new FormGroup<ZoneForm>({
    zoneCode: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    zoneName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    country: new FormControl('India', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    state: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    district: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    postalCode: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(20)],
    }),
    latitude: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(-90),
      Validators.max(90),
    ]),
    longitude: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(-180),
      Validators.max(180),
    ]),
    radiusKm: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
  });

  protected readonly statuses = ZONE_MANAGEABLE_STATUSES;
  protected selectedState: string | null = null;
  protected formOpen = false;
  protected editingZone: ZoneResponse | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store) {
    this.zones$ = this.store.select(selectFilteredZones);
    this.states$ = this.store.select(selectDistinctStates);
    this.loading$ = this.store.select(selectZonesLoading);
    this.saving$ = this.store.select(selectZonesSaving);
    this.updatingZoneId$ = this.store.select(selectUpdatingZoneId);
    this.error$ = this.store.select(selectZonesError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearZonesError());
    this.store.dispatch(loadZones({}));

    this.searchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((search) => {
        this.store.dispatch(setZonesSearch({ search }));
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearSelectedZone());
    this.store.dispatch(clearZonesError());
  }

  protected applyStateFilter(event: Event): void {
    const state = (event.target as HTMLSelectElement).value.trim();
    this.selectedState = state || null;
    this.store.dispatch(
      loadZones({
        state: this.selectedState ?? undefined,
      }),
    );
  }

  protected clearFilters(): void {
    this.selectedState = null;
    this.searchControl.setValue('', { emitEvent: false });
    this.store.dispatch(clearZoneFilters());
    this.store.dispatch(loadZones({}));
  }

  protected openCreate(): void {
    this.store.dispatch(clearZonesError());
    this.editingZone = null;
    this.form.reset({
      zoneCode: '',
      zoneName: '',
      country: 'India',
      state: '',
      district: '',
      postalCode: '',
      latitude: null,
      longitude: null,
      radiusKm: null,
    });
    this.formOpen = true;
  }

  protected openEdit(zone: ZoneResponse): void {
    this.store.dispatch(clearZonesError());
    this.editingZone = zone;
    this.form.reset({
      zoneCode: zone.zoneCode,
      zoneName: zone.zoneName,
      country: zone.country,
      state: zone.state,
      district: zone.district,
      postalCode: zone.postalCode ?? '',
      latitude: zone.latitude,
      longitude: zone.longitude,
      radiusKm: zone.radiusKm,
    });
    this.formOpen = true;
  }

  protected closeForm(): void {
    this.formOpen = false;
    this.editingZone = null;
    this.form.reset();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (raw.latitude === null || raw.longitude === null || raw.radiusKm === null) {
      this.form.markAllAsTouched();
      return;
    }

    const request: ZoneRequest = {
      zoneCode: raw.zoneCode.trim(),
      zoneName: raw.zoneName.trim(),
      country: raw.country.trim(),
      state: raw.state.trim(),
      district: raw.district.trim(),
      postalCode: raw.postalCode.trim() || undefined,
      latitude: Number(raw.latitude),
      longitude: Number(raw.longitude),
      radiusKm: Number(raw.radiusKm),
    };

    if (this.editingZone) {
      this.store.dispatch(
        updateZone({
          zoneId: this.editingZone.id,
          request,
        }),
      );
    } else {
      this.store.dispatch(createZone({ request }));
    }

    this.formOpen = false;
    this.editingZone = null;
  }

  protected changeStatus(zone: ZoneResponse, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const status = select.value as ZoneManageableStatus;

    if (status === zone.status) return;

    this.store.dispatch(
      updateZoneStatus({
        zoneId: zone.id,
        status,
      }),
    );
  }

  protected archive(zone: ZoneResponse): void {
    const confirmed = window.confirm(
      `Archive ${zone.zoneName}? Archived zones cannot be retrieved through the normal zone endpoints.`,
    );

    if (confirmed) {
      this.store.dispatch(archiveZone({ zoneId: zone.id }));
    }
  }

  protected toggleAlert(zone: ZoneResponse): void {
    if (zone.weatherAlert) {
      if (window.confirm(`Clear the weather alert for ${zone.zoneName}? New policies can be sold there again.`)) {
        this.store.dispatch(updateZoneAlert({ zoneId: zone.id, active: false }));
      }
      return;
    }

    const message = window.prompt(
      `Raise a weather alert for ${zone.zoneName}? No new policies can be sold there until it is cleared.\n\nAlert message:`,
      'Heavy rainfall warning',
    );

    if (message !== null) {
      this.store.dispatch(updateZoneAlert({ zoneId: zone.id, active: true, message }));
    }
  }

  protected setExposureCap(zone: ZoneResponse): void {
    const input = window.prompt(
      `Maximum total cover (₹) for ${zone.zoneName}.\nLeave empty to remove the cap.`,
      zone.maxExposure ? String(zone.maxExposure) : '',
    );

    if (input === null) return;

    const text = input.replace(/[,\s₹]/g, '');
    if (text === '') {
      this.store.dispatch(updateZoneExposureCap({ zoneId: zone.id, maxExposure: null }));
      return;
    }

    const maxExposure = Number(text);
    if (!Number.isFinite(maxExposure) || maxExposure <= 0) {
      window.alert('Enter an amount greater than zero, or leave it empty to remove the cap.');
      return;
    }

    this.store.dispatch(updateZoneExposureCap({ zoneId: zone.id, maxExposure }));
  }

  protected isUpdating(zoneId: number, updatingZoneId: number | null): boolean {
    return zoneId === updatingZoneId;
  }
}
