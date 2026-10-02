import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
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

  ngOnInit(): void {
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
