import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  PolicyResponse,
  PolicyStatus,
} from '../../dtos/policies/policy-response.dto';
import { loadMyPolicies } from '../../state/policies/policies.actions';
import {
  selectActivePolicyCount,
  selectActiveSumInsured,
  selectMyPolicies,
  selectPendingPolicyCount,
  selectPoliciesError,
  selectPoliciesLoading,
} from '../../state/policies/policies.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface FilterChip {
  label: string;
  value: PolicyStatus | null;
}

@Component({
  selector: 'app-customer-policies',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    StatCardComponent,
  ],
  templateUrl: './customer-policies.component.html',
  styleUrl: './customer-policies.component.css',
})
export class CustomerPoliciesComponent implements OnInit {
  readonly policies$: Observable<PolicyResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<string | null>;
  readonly activeCount$: Observable<number>;
  readonly activeSumInsured$: Observable<number>;
  readonly pendingCount$: Observable<number>;

  protected readonly filters: FilterChip[] = [
    { label: 'All', value: null },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Cancelled', value: 'CANCELLED' },
    { label: 'Expired', value: 'EXPIRED' },
  ];

  protected activeFilter: PolicyStatus | null = null;

  constructor(private readonly store: Store) {
    this.policies$ = this.store.select(selectMyPolicies);
    this.loading$ = this.store.select(selectPoliciesLoading);
    this.error$ = this.store.select(selectPoliciesError);
    this.activeCount$ = this.store.select(selectActivePolicyCount);
    this.activeSumInsured$ = this.store.select(selectActiveSumInsured);
    this.pendingCount$ = this.store.select(selectPendingPolicyCount);
  }

  ngOnInit(): void {
    this.store.dispatch(loadMyPolicies({}));
  }

  protected applyFilter(status: PolicyStatus | null): void {
    this.activeFilter = status;
    this.store.dispatch(loadMyPolicies({
      status: status ?? undefined,
    }));
  }
}