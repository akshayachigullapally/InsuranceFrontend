import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {
  TriggerEventResponse,
} from '../../dtos/trigger-events/trigger-event-response.dto';
import {
  clearSelectedTriggerEvent,
  clearTriggerEventFilters,
  clearTriggerEventsError,
  loadTriggerEvents,
  setTriggerEventsSearch,
} from '../../state/trigger-events/trigger-events.actions';
import {
  selectFilteredTriggerEvents,
  selectTriggerEventsError,
  selectTriggerEventsLoading,
  selectUpdatingTriggerEventId,
} from '../../state/trigger-events/trigger-events.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-admin-trigger-events',
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
  templateUrl: './admin-trigger-events.component.html',
  styleUrl: './admin-trigger-events.component.css',
})
export class AdminTriggerEventsComponent implements OnInit, OnDestroy {
  readonly events$: Observable<TriggerEventResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly updatingEventId$: Observable<number | null>;
  readonly error$: Observable<string | null>;

  readonly searchControl = new FormControl('', { nonNullable: true });

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store) {
    this.events$ = this.store.select(selectFilteredTriggerEvents);
    this.loading$ = this.store.select(selectTriggerEventsLoading);
    this.updatingEventId$ = this.store.select(selectUpdatingTriggerEventId);
    this.error$ = this.store.select(selectTriggerEventsError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearTriggerEventsError());
    this.store.dispatch(loadTriggerEvents());

    this.searchControl.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(search => {
      this.store.dispatch(setTriggerEventsSearch({ search }));
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearSelectedTriggerEvent());
    this.store.dispatch(clearTriggerEventsError());
  }

  protected clearFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.store.dispatch(clearTriggerEventFilters());
    this.store.dispatch(loadTriggerEvents());
  }

  protected isUpdating(
    eventId: number,
    updatingEventId: number | null,
  ): boolean {
    return eventId === updatingEventId;
  }
}
