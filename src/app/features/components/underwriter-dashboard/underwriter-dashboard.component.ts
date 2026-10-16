import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import {
  PolicyResponse,
  PolicyReviewHistoryResponse,
} from '../../dtos/policies/policy-response.dto';
import { PolicyService } from '../../services/policy.service';
import { loadReviewPolicies } from '../../state/policies/policies.actions';
import {
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
  // The decision cards use the signed-in underwriter's own decisions, the same
  // data as the Review history page, so the two pages always agree.
  readonly approvedCount$: Observable<number>;
  readonly approvedCover$: Observable<number>;
  readonly approvalRate$: Observable<number>;

  constructor(
    private readonly store: Store,
    policyService: PolicyService,
  ) {
    this.reviewPolicies$ = this.store.select(selectReviewPolicies);
    this.pendingCount$ = this.store.select(selectPendingReviewCount);

    const decisions$ = policyService.getReviewHistory().pipe(
      catchError(() => of([] as PolicyReviewHistoryResponse[])),
      shareReplay(1),
    );
    const approved$ = decisions$.pipe(map((all) => all.filter((d) => d.decision === 'APPROVED')));

    this.approvedCount$ = approved$.pipe(map((approved) => approved.length));
    this.approvedCover$ = approved$.pipe(
      map((approved) => approved.reduce((sum, d) => sum + (d.sumInsured ?? 0), 0)),
    );
    this.approvalRate$ = decisions$.pipe(
      map((all) => {
        const approved = all.filter((d) => d.decision === 'APPROVED').length;
        return all.length === 0 ? 0 : Math.round((approved / all.length) * 1000) / 10;
      }),
    );
  }

  ngOnInit(): void {
    this.store.dispatch(loadReviewPolicies());
  }
}
