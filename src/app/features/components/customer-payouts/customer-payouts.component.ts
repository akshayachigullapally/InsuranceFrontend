import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PayoutResponse } from '../../dtos/financial/payout-response.dto';
import {
  clearPayoutsError,
  loadMyPayouts,
} from '../../state/payouts/payouts.actions';
import {
  selectPayouts,
  selectPayoutsError,
  selectPayoutsLoading,
} from '../../state/payouts/payouts.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-customer-payouts',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './customer-payouts.component.html',
  styleUrl: './customer-payouts.component.css',
})
export class CustomerPayoutsComponent implements OnInit, OnDestroy {
  readonly payouts$: Observable<PayoutResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  constructor(private readonly store: Store) {
    this.payouts$ = this.store.select(selectPayouts);
    this.loading$ = this.store.select(selectPayoutsLoading);
    this.error$ = this.store.select(selectPayoutsError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearPayoutsError());
    this.store.dispatch(loadMyPayouts());
  }

  ngOnDestroy(): void {
    this.store.dispatch(clearPayoutsError());
  }
}
