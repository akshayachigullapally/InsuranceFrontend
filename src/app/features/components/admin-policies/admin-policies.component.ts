import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  POLICY_STATUSES,
  PolicyResponse,
  PolicyStatus,
} from '../../dtos/policies/policy-response.dto';
import { clearPoliciesError, loadAdminPolicies } from '../../state/policies/policies.actions';
import {
  selectAdminPolicies,
  selectPoliciesError,
  selectPoliciesLoading,
} from '../../state/policies/policies.selectors';
import { ZoneService } from '../../services/zone.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface StatusFilter {
  label: string;
  value: PolicyStatus | null;
}

@Component({
  selector: 'app-admin-policies',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    RouterLink,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './admin-policies.component.html',
})
export class AdminPoliciesComponent implements OnInit {
  readonly policies$: Observable<PolicyResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  protected readonly filters: StatusFilter[] = [
    { label: 'All', value: null },
    ...POLICY_STATUSES.map((status) => ({
      label: this.statusLabel(status),
      value: status,
    })),
  ];

  protected selectedStatus: PolicyStatus | null = null;

  private zoneNamesById: Record<number, string> = {};

  constructor(
    private readonly store: Store,
    private readonly zoneService: ZoneService,
  ) {
    this.policies$ = this.store.select(selectAdminPolicies);
    this.loading$ = this.store.select(selectPoliciesLoading);
    this.error$ = this.store.select(selectPoliciesError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearPoliciesError());
    this.store.dispatch(loadAdminPolicies({}));

    this.zoneService.getAllZones().subscribe((zones) => {
      this.zoneNamesById = zones.reduce(
        (map, zone) => ({ ...map, [zone.id]: zone.zoneName }),
        {} as Record<number, string>,
      );
    });
  }

  protected zoneLabel(locationZoneId: number): string {
    const name = this.zoneNamesById[locationZoneId];

    return name ? `${name} (Zone #${locationZoneId})` : `Zone #${locationZoneId}`;
  }

  protected applyFilter(status: PolicyStatus | null): void {
    this.selectedStatus = status;
    this.store.dispatch(
      loadAdminPolicies({
        status: status ?? undefined,
      }),
    );
  }

  protected statusLabel(status: PolicyStatus): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }
}
