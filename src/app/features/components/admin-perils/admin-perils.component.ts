import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
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
  PERIL_MANAGEABLE_STATUSES,
  PerilManageableStatus,
  PerilRequest,
  PerilResponse,
} from '../../dtos/perils/peril-response.dto';
import {
  archivePeril,
  archivePerilSuccess,
  clearSelectedPeril,
  clearPerilFilters,
  clearPerilsError,
  createPeril,
  loadPerils,
  setPerilsSearch,
  updatePeril,
  updatePerilStatus,
} from '../../state/perils/perils.actions';
import {
  selectFilteredPerils,
  selectUpdatingPerilId,
  selectPerilsError,
  selectPerilsLoading,
  selectPerilsSaving,
} from '../../state/perils/perils.selectors';
import { DialogService } from '../../../shared/services/dialog.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface PerilForm {
  perilCode: FormControl<string>;
  perilName: FormControl<string>;
  description: FormControl<string>;
}

import { Actions, ofType } from '@ngrx/effects';
import { PerilService } from '../../services/peril.service';
import { ToastService } from '../../../shared/services/toast.service';
import {
  ArchivedItem,
  ArchivedItemsComponent,
} from '../../../shared/components/archived-items/archived-items.component';

@Component({
  selector: 'app-admin-perils',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    ArchivedItemsComponent,
  ],
  templateUrl: './admin-perils.component.html',
  styleUrl: './admin-perils.component.css',
})
export class AdminPerilsComponent implements OnInit, OnDestroy {
  readonly perils$: Observable<PerilResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly saving$: Observable<boolean>;
  readonly updatingPerilId$: Observable<number | null>;
  readonly error$: Observable<string | null>;

  readonly searchControl = new FormControl('', { nonNullable: true });

  readonly form = new FormGroup<PerilForm>({
    perilCode: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    perilName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
  });

  protected readonly statuses = PERIL_MANAGEABLE_STATUSES;
  protected formOpen = false;
  protected editingPeril: PerilResponse | null = null;

  private readonly destroy$ = new Subject<void>();

  private readonly dialog = inject(DialogService);

  constructor(private readonly store: Store) {
    this.perils$ = this.store.select(selectFilteredPerils);
    this.loading$ = this.store.select(selectPerilsLoading);
    this.saving$ = this.store.select(selectPerilsSaving);
    this.updatingPerilId$ = this.store.select(selectUpdatingPerilId);
    this.error$ = this.store.select(selectPerilsError);
  }

  private readonly archiveService = inject(PerilService);
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
    this.archiveService.restorePeril(id).subscribe({
      next: (restored) => {
        this.restoringId.set(null);
        this.archivedItems.update((items) => items.filter((item) => item.id !== id));
        this.store.dispatch(loadPerils());
        this.toast.show({
          type: 'success',
          title: 'Peril restored',
          message: `${((peril: PerilResponse): ArchivedItem => ({ id: peril.id, name: peril.perilName, detail: peril.perilCode }))(restored).name} is back as Inactive. Set it to Active when ready.`,
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
    this.archiveService.getArchivedPerils().subscribe({
      next: (items) => {
        this.archivedItems.set(items.map((peril: PerilResponse): ArchivedItem => ({ id: peril.id, name: peril.perilName, detail: peril.perilCode })));
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
      .pipe(ofType(archivePerilSuccess), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.archivedOpen()) {
          this.loadArchived();
        }
      });
    this.store.dispatch(clearPerilsError());
    this.store.dispatch(loadPerils());

    this.searchControl.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(search => {
      this.store.dispatch(setPerilsSearch({ search }));
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearSelectedPeril());
    this.store.dispatch(clearPerilsError());
  }

  protected clearFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.store.dispatch(clearPerilFilters());
    this.store.dispatch(loadPerils());
  }

  protected openCreate(): void {
    this.store.dispatch(clearPerilsError());
    this.editingPeril = null;
    this.form.reset({
      perilCode: '',
      perilName: '',
      description: '',
    });
    this.formOpen = true;
  }

  protected openEdit(peril: PerilResponse): void {
    this.store.dispatch(clearPerilsError());
    this.editingPeril = peril;
    this.form.reset({
      perilCode: peril.perilCode,
      perilName: peril.perilName,
      description: peril.description,
    });
    this.formOpen = true;
  }

  protected closeForm(): void {
    this.formOpen = false;
    this.editingPeril = null;
    this.form.reset();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const request: PerilRequest = {
      perilCode: raw.perilCode.trim(),
      perilName: raw.perilName.trim(),
      description: raw.description.trim(),
    };

    if (this.editingPeril) {
      this.store.dispatch(updatePeril({
        perilId: this.editingPeril.id,
        request,
      }));
    } else {
      this.store.dispatch(createPeril({ request }));
    }

    this.formOpen = false;
    this.editingPeril = null;
  }

  protected changeStatus(peril: PerilResponse, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const status = select.value as PerilManageableStatus;

    if (status === peril.status) return;

    this.store.dispatch(updatePerilStatus({
      perilId: peril.id,
      status,
    }));
  }

  protected async archive(peril: PerilResponse): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: `Archive ${peril.perilName}?`,
      message: 'Archived perils are hidden from products and cannot be picked again.',
      confirmLabel: 'Archive peril',
      danger: true,
    });

    if (confirmed) {
      this.store.dispatch(archivePeril({ perilId: peril.id }));
    }
  }

  protected isUpdating(
    perilId: number,
    updatingPerilId: number | null,
  ): boolean {
    return perilId === updatingPerilId;
  }
}
