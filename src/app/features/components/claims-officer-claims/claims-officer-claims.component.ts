import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ClaimResponse } from '../../dtos/claims/claim-response.dto';
import {
  clearClaimsError,
  loadSubmittedClaims,
} from '../../state/claims/claims.actions';
import {
  selectClaimsError,
  selectClaimsLoading,
  selectSubmittedClaims,
  selectSubmittedClaimedAmount,
  selectSubmittedReviewCount,
} from '../../state/claims/claims.selectors';
import { ZoneService } from '../../services/zone.service';
import { parseLocalDateOnly } from '../../utils/local-date.util';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-claims-officer-claims',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    RouterLink,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatCardComponent,
    StatusBadgeComponent,
  ],
  providers: [DatePipe],
  templateUrl: './claims-officer-claims.component.html',
  styleUrl: './claims-officer-claims.component.css',
})
export class ClaimsOfficerClaimsComponent implements OnInit {
  readonly claims$: Observable<ClaimResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<string | null>;
  readonly submittedCount$: Observable<number>;
  readonly totalClaimedAmount$: Observable<number>;

  private zoneNamesById: Record<number, string> = {};

  constructor(
    private readonly store: Store,
    private readonly zoneService: ZoneService,
    private readonly datePipe: DatePipe,
  ) {
    this.claims$ = this.store.select(selectSubmittedClaims);
    this.loading$ = this.store.select(selectClaimsLoading);
    this.error$ = this.store.select(selectClaimsError);
    this.submittedCount$ = this.store.select(selectSubmittedReviewCount);
    this.totalClaimedAmount$ = this.store.select(selectSubmittedClaimedAmount);
  }

  ngOnInit(): void {
    this.store.dispatch(clearClaimsError());
    this.store.dispatch(loadSubmittedClaims());

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

  protected formatDateOnly(value?: string | null): string {
    const date = parseLocalDateOnly(value);

    return date
      ? this.datePipe.transform(date, 'mediumDate') ?? 'Not available'
      : 'Not available';
  }

  protected averageClaimAmount(claims: ClaimResponse[]): number {
    if (claims.length === 0) return 0;
    const total = claims.reduce((sum, claim) => sum + claim.claimedAmount, 0);
    return Math.round((total / claims.length) * 100) / 100;
  }

  protected incidentLabel(incidentType: string): string {
    return incidentType
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, character => character.toUpperCase());
  }

  protected triggerReference(claim: ClaimResponse): string {
    if (claim.manualReviewRequired) return 'Manual review';

    return claim.triggerEventReference ?? 'Not available';
  }

  protected triggerEventLabel(claim: ClaimResponse): string {
    if (claim.manualReviewRequired) return 'Pending validation';

    return claim.triggerEventId != null
      ? `Event #${claim.triggerEventId}`
      : 'Not available';
  }
}