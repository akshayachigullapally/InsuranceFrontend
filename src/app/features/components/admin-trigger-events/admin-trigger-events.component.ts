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
  TriggerEventResponse,
  TRIGGER_EVENT_STATUSES,
  TriggerEventStatus,
} from '../../dtos/trigger-events/trigger-event-response.dto';
import {
  clearSelectedTriggerEvent,
  clearTriggerEventFilters,
  clearTriggerEventsError,
  loadTriggerEvents,
  rejectTriggerEvent,
  setTriggerEventsSearch,
  startValidation,
  verifyTriggerEvent,
} from '../../state/trigger-events/trigger-events.actions';
import {
  selectFilteredTriggerEvents,
  selectTriggerEventsError,
  selectTriggerEventsLoading,
  selectTriggerEventsSaving,
  selectUpdatingTriggerEventId,
} from '../../state/trigger-events/trigger-events.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface ReviewForm {
  reviewNotes: FormControl<string>;
}

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
  readonly saving$: Observable<boolean>;
  readonly updatingEventId$: Observable<number | null>;
  readonly error$: Observable<string | null>;

  readonly searchControl = new FormControl('', { nonNullable: true });

  readonly reviewForm = new FormGroup<ReviewForm>({
    reviewNotes: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
  });

  protected readonly statuses = TRIGGER_EVENT_STATUSES;
  protected reviewFormOpen = false;
  protected reviewingEvent: TriggerEventResponse | null = null;
  protected reviewAction: 'verify' | 'reject' = 'verify';

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store) {
    this.events$ = this.store.select(selectFilteredTriggerEvents);
    this.loading$ = this.store.select(selectTriggerEventsLoading);
    this.saving$ = this.store.select(selectTriggerEventsSaving);
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

  protected startValidation(event: TriggerEventResponse): void {
    const confirmed = window.confirm(
      `Start validation for event "${event.eventReference}"?`,
    );

    if (confirmed) {
      this.store.dispatch(startValidation({ eventId: event.id }));
    }
  }

  protected openVerify(event: TriggerEventResponse): void {
    this.reviewingEvent = event;
    this.reviewAction = 'verify';
    this.reviewForm.reset({ reviewNotes: '' });
    this.reviewFormOpen = true;
  }

  protected openReject(event: TriggerEventResponse): void {
    this.reviewingEvent = event;
    this.reviewAction = 'reject';
    this.reviewForm.reset({ reviewNotes: '' });
    this.reviewFormOpen = true;
  }

  protected closeReviewForm(): void {
    this.reviewFormOpen = false;
    this.reviewingEvent = null;
    this.reviewForm.reset();
  }

  protected submitReview(): void {
    if (this.reviewForm.invalid || !this.reviewingEvent) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const notes = this.reviewForm.getRawValue().reviewNotes.trim();

    if (this.reviewAction === 'verify') {
      this.store.dispatch(verifyTriggerEvent({
        eventId: this.reviewingEvent.id,
        reviewNotes: notes,
      }));
    } else {
      this.store.dispatch(rejectTriggerEvent({
        eventId: this.reviewingEvent.id,
        reviewNotes: notes,
      }));
    }

    this.reviewFormOpen = false;
    this.reviewingEvent = null;
  }

  protected isUpdating(
    eventId: number,
    updatingEventId: number | null,
  ): boolean {
    return eventId === updatingEventId;
  }
}
