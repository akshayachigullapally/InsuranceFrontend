import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {
  TriggerEvaluationResponse,
  TRIGGER_EVALUATION_RESULTS,
  TriggerEvaluationResult,
} from '../../dtos/trigger-evaluations/trigger-evaluation-response.dto';
import {
  clearSelectedTriggerEvaluation,
  clearTriggerEvaluationFilters,
  clearTriggerEvaluationsError,
  loadTriggerEvaluations,
  setTriggerEvaluationsSearch,
} from '../../state/trigger-evaluations/trigger-evaluations.actions';
import {
  selectFilteredTriggerEvaluations,
  selectTriggerEvaluationsError,
  selectTriggerEvaluationsLoading,
} from '../../state/trigger-evaluations/trigger-evaluations.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-admin-evaluations',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    ReactiveFormsModule,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './admin-evaluations.component.html',
  styleUrl: './admin-evaluations.component.css',
})
export class AdminEvaluationsComponent implements OnInit, OnDestroy {
  readonly evaluations$: Observable<TriggerEvaluationResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  readonly searchControl = new FormControl('', { nonNullable: true });

  protected readonly resultStyles: Record<TriggerEvaluationResult, string> = {
    MATCHED: 'bg-green-100 text-green-800',
    NOT_MATCHED: 'bg-gray-100 text-gray-600',
    INSUFFICIENT_OBSERVATIONS: 'bg-amber-100 text-amber-800',
  };

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store) {
    this.evaluations$ = this.store.select(selectFilteredTriggerEvaluations);
    this.loading$ = this.store.select(selectTriggerEvaluationsLoading);
    this.error$ = this.store.select(selectTriggerEvaluationsError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearTriggerEvaluationsError());
    this.store.dispatch(loadTriggerEvaluations());

    this.searchControl.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(search => {
      this.store.dispatch(setTriggerEvaluationsSearch({ search }));
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearSelectedTriggerEvaluation());
    this.store.dispatch(clearTriggerEvaluationsError());
  }

  protected clearFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.store.dispatch(clearTriggerEvaluationFilters());
    this.store.dispatch(loadTriggerEvaluations());
  }

  protected resultLabel(result: TriggerEvaluationResult): string {
    switch (result) {
      case 'MATCHED':
        return 'Matched';
      case 'NOT_MATCHED':
        return 'Not matched';
      case 'INSUFFICIENT_OBSERVATIONS':
        return 'Insufficient data';
      default:
        return result;
    }
  }
}
