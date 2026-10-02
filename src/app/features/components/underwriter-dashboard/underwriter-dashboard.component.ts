import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PolicyResponse } from '../../dtos/policies/policy-response.dto';
import { loadAdminPolicies, loadReviewPolicies } from '../../state/policies/policies.actions';
import {
  selectAdminActivePolicyCount,
  selectAdminActivePremium,
  selectAdminApprovedPolicyCount,
  selectAdminRejectedPolicyCount,
  selectPendingReviewCount,
  selectReviewPolicies,
} from '../../state/policies/policies.selectors';
import { ClimateIllustrationComponent } from '../../../shared/components/climate-illustration/climate-illustration.component';

@Component({
  selector: 'app-underwriter-dashboard',
  standalone: true,
  imports: [RouterLink, AsyncPipe, DecimalPipe, DatePipe, StatCardComponent, StatusBadgeComponent, ClimateIllustrationComponent],
  templateUrl: './underwriter-dashboard.component.html',
})
export class UnderwriterDashboardComponent implements OnInit {
  readonly reviewPolicies$: Observable<PolicyResponse[]>;
  readonly pendingCount$: Observable<number>;
  readonly activePolicyCount$: Observable<number>;
  readonly activePremium$: Observable<number>;
  readonly approvalRate$: Observable<number>;

  constructor(private readonly store: Store) {
    this.reviewPolicies$ = this.store.select(selectReviewPolicies);
    this.pendingCount$ = this.store.select(selectPendingReviewCount);
    this.activePolicyCount$ = this.store.select(selectAdminActivePolicyCount);
    this.activePremium$ = this.store.select(selectAdminActivePremium);
    this.approvalRate$ = combineLatest([
      this.store.select(selectAdminApprovedPolicyCount),
      this.store.select(selectAdminRejectedPolicyCount),
    ]).pipe(
      map(([approved, rejected]) => {
        const total = approved + rejected;
        return total === 0 ? 0 : Math.round((approved / total) * 1000) / 10;
      }),
    );
  }

  ngOnInit(): void {
    this.store.dispatch(loadReviewPolicies());
    this.store.dispatch(loadAdminPolicies({}));
  }
}
