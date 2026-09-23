import {
  AsyncPipe,
  DatePipe,
  DecimalPipe,
} from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PolicyResponse } from '../../dtos/policies/policy-response.dto';
import {
  clearPoliciesError,
  loadReviewPolicies,
} from '../../state/policies/policies.actions';
import {
  selectPendingReviewCount,
  selectPoliciesError,
  selectPoliciesLoading,
  selectReviewPolicies,
} from '../../state/policies/policies.selectors';
import { ZoneService } from '../../services/zone.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-underwriter-policies',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    EmptyStateComponent,
    StatCardComponent,
  ],
  templateUrl: './underwriter-policies.component.html',
  styleUrl: './underwriter-policies.component.css',
})
export class UnderwriterPoliciesComponent implements OnInit {
  readonly policies$: Observable<PolicyResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<string | null>;
  readonly pendingCount$: Observable<number>;

  private zoneNamesById: Record<number, string> = {};

  constructor(
    private readonly store: Store,
    private readonly zoneService: ZoneService,
  ) {
    this.policies$ = this.store.select(selectReviewPolicies);
    this.loading$ = this.store.select(selectPoliciesLoading);
    this.error$ = this.store.select(selectPoliciesError);
    this.pendingCount$ = this.store.select(selectPendingReviewCount);
  }

  ngOnInit(): void {
    this.store.dispatch(clearPoliciesError());
    this.store.dispatch(loadReviewPolicies());

    this.zoneService.getActiveZones().subscribe(zones => {
      this.zoneNamesById = zones.reduce(
        (map, zone) => ({ ...map, [zone.id]: zone.zoneName }),
        {} as Record<number, string>,
      );
    });
  }

  protected zoneLabel(locationZoneId: number): string {
    const name = this.zoneNamesById[locationZoneId];

    return name
      ? `${name} (Zone #${locationZoneId})`
      : `Zone #${locationZoneId}`;
  }

  protected totalSumInsured(
    policies: PolicyResponse[],
  ): number {
    return policies.reduce(
      (sum, policy) => sum + policy.sumInsured,
      0,
    );
  }

  protected averagePremium(
    policies: PolicyResponse[],
  ): number {
    if (policies.length === 0) {
      return 0;
    }

    const total = policies.reduce(
      (sum, policy) => sum + policy.premiumAmount,
      0,
    );

    return Math.round(
      (total / policies.length) * 100,
    ) / 100;
  }
}