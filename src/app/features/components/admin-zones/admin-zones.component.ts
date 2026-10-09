import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
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
  archiveZoneSuccess,
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
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
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

const DEFAULT_ALERT_MESSAGE = 'Heavy rainfall warning';

type ZoneAction = {
  kind: 'raiseAlert' | 'clearAlert' | 'cap' | 'archive';
  zone: ZoneResponse;
};

import { Actions, ofType } from '@ngrx/effects';
import { ZoneService } from '../../services/zone.service';
import { ToastService } from '../../../shared/services/toast.service';
import {
  ArchivedItem,
  ArchivedItemsComponent,
} from '../../../shared/components/archived-items/archived-items.component';

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
    ArchivedItemsComponent,
    ConfirmationDialogComponent,
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
  /** Alert, cap or archive dialog currently open, and the zone it acts on. */
  protected zoneAction: ZoneAction | null = null;

  readonly alertForm = new FormGroup({
    message: new FormControl(DEFAULT_ALERT_MESSAGE, {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
  });

  readonly capForm = new FormGroup({
    maxExposure: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
  });
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

  private readonly archiveService = inject(ZoneService);
  private readonly toast = inject(ToastService);
  private readonly actions$ = inject(Actions);

  protected readonly archivedOpen = signal(false);
  protected readonly archivedLoading = signal(false);
  protected readonly archivedItems = signal<ArchivedItem[]>([]);
  protected readonly restoringId = signal<number | null>(null);

  protected toggleArchived(): void {
    this.archivedOpen.update((open) => !open);
    if (this.archivedOpen()) {
      this.loadArchived();
    }
  }

  protected restoreArchived(id: number): void {
    this.restoringId.set(id);
    this.archiveService.restoreZone(id).subscribe({
      next: (restored) => {
        this.restoringId.set(null);
        this.archivedItems.update((items) => items.filter((item) => item.id !== id));
        this.store.dispatch(loadZones({ state: this.selectedState ?? undefined }));
        this.toast.show({
          type: 'success',
          title: 'Zone restored',
          message: `${((zone: ZoneResponse): ArchivedItem => ({ id: zone.id, name: zone.zoneName, detail: `${zone.zoneCode} · ${zone.district}, ${zone.state}` }))(restored).name} is back as Inactive. Set it to Active when ready.`,
        });
      },
      error: (error) => {
        this.restoringId.set(null);
        this.toast.show({
          type: 'error',
          title: 'Restore failed',
          message: error?.error?.message ?? error?.error?.messages?.[0] ?? 'Please try again.',
        });
      },
    });
  }

  private loadArchived(): void {
    this.archivedLoading.set(true);
    this.archiveService.getArchivedZones().subscribe({
      next: (items) => {
        this.archivedItems.set(items.map((zone: ZoneResponse): ArchivedItem => ({ id: zone.id, name: zone.zoneName, detail: `${zone.zoneCode} · ${zone.district}, ${zone.state}` })));
        this.archivedLoading.set(false);
      },
      error: () => {
        this.archivedItems.set([]);
        this.archivedLoading.set(false);
      },
    });
  }

  ngOnInit(): void {
    // Keep the archived list current when something is archived from the table.
    this.actions$
      .pipe(ofType(archiveZoneSuccess), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.archivedOpen()) {
          this.loadArchived();
        }
      });
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
    this.zoneAction = { kind: 'archive', zone };
  }

  protected toggleAlert(zone: ZoneResponse): void {
    this.store.dispatch(clearZonesError());
    if (zone.weatherAlert) {
      this.zoneAction = { kind: 'clearAlert', zone };
      return;
    }
    this.alertForm.reset({ message: DEFAULT_ALERT_MESSAGE });
    this.zoneAction = { kind: 'raiseAlert', zone };
  }

  protected setExposureCap(zone: ZoneResponse): void {
    this.store.dispatch(clearZonesError());
    this.capForm.reset({ maxExposure: zone.maxExposure ?? null });
    this.zoneAction = { kind: 'cap', zone };
  }

  protected closeZoneAction(): void {
    this.zoneAction = null;
  }

  /** Confirms the open archive / clear-alert dialog. */
  protected confirmZoneAction(): void {
    const action = this.zoneAction;
    if (!action) return;
    this.zoneAction = null;

    if (action.kind === 'archive') {
      this.store.dispatch(archiveZone({ zoneId: action.zone.id }));
    } else if (action.kind === 'clearAlert') {
      this.store.dispatch(updateZoneAlert({ zoneId: action.zone.id, active: false }));
    }
  }

  protected submitAlert(): void {
    const action = this.zoneAction;
    if (action?.kind !== 'raiseAlert') return;
    if (this.alertForm.invalid) {
      this.alertForm.markAllAsTouched();
      return;
    }
    this.zoneAction = null;
    this.store.dispatch(
      updateZoneAlert({
        zoneId: action.zone.id,
        active: true,
        message: this.alertForm.controls.message.value.trim(),
      }),
    );
  }

  /** Saves the cap; with removeCap (or an empty amount) the zone gets no cap. */
  protected submitCap(removeCap = false): void {
    const action = this.zoneAction;
    if (action?.kind !== 'cap') return;
    const amount = this.capForm.controls.maxExposure.value;
    if (!removeCap && amount !== null && this.capForm.invalid) {
      this.capForm.markAllAsTouched();
      return;
    }
    this.zoneAction = null;
    this.store.dispatch(
      updateZoneExposureCap({
        zoneId: action.zone.id,
        maxExposure: removeCap || amount === null ? null : amount,
      }),
    );
  }

  protected isUpdating(zoneId: number, updatingZoneId: number | null): boolean {
    return zoneId === updatingZoneId;
  }
}
