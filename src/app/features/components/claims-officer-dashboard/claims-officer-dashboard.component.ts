import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ClaimResponse } from '../../dtos/claims/claim-response.dto';
import {
  clearClaimsError,
  loadSubmittedClaims,
} from '../../state/claims/claims.actions';
import {
  selectSubmittedClaimedAmount,
  selectSubmittedClaims,
  selectSubmittedReviewCount,
} from '../../state/claims/claims.selectors';

@Component({
  selector: 'app-claims-officer-dashboard',
  standalone: true,
  imports: [RouterLink, AsyncPipe, DatePipe, StatCardComponent, StatusBadgeComponent],
  templateUrl: './claims-officer-dashboard.component.html',
  styleUrl: './claims-officer-dashboard.component.css',
})
export class ClaimsOfficerDashboardComponent implements OnInit {
  readonly claims$: Observable<ClaimResponse[]>;
  readonly submittedCount$: Observable<number>;
  readonly manualClaimCount$: Observable<number>;
  readonly totalClaimedAmount$: Observable<number>;
  readonly averageClaimAmount$: Observable<number>;

  constructor(private readonly store: Store) {
    this.claims$ = this.store.select(selectSubmittedClaims);
    this.submittedCount$ = this.store.select(selectSubmittedReviewCount);
    this.manualClaimCount$ = this.store
      .select(selectSubmittedClaims)
      .pipe(map(claims => claims.filter(claim => claim.triggerEventId == null).length));
    this.totalClaimedAmount$ = this.store.select(selectSubmittedClaimedAmount);
    this.averageClaimAmount$ = this.store.select(selectSubmittedClaims).pipe(
      map(claims => {
        if (claims.length === 0) return 0;
        const total = claims.reduce((sum, claim) => sum + claim.claimedAmount, 0);
        return Math.round((total / claims.length) * 100) / 100;
      }),
    );
  }

  ngOnInit(): void {
    this.store.dispatch(clearClaimsError());
    this.store.dispatch(loadSubmittedClaims());
  }
}