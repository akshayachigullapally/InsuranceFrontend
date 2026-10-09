import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { cancelClaim } from '../../state/claims/claims.actions';
import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, filter } from 'rxjs';
import { mergeNewNotifications } from '../../state/notifications/notifications.actions';
import {
  CLAIM_STATUSES,
  ClaimResponse,
  ClaimStatus,
} from '../../dtos/claims/claim-response.dto';
import {
  clearClaimsError,
  loadMyClaims,
} from '../../state/claims/claims.actions';
import {
  selectClaimsError,
  selectClaimsLoading,
  selectMyApprovedAmount,
  selectMyApprovedClaimCount,
  selectMyClaims,
  selectMySubmittedClaimCount,
} from '../../state/claims/claims.selectors';
import { ZoneService } from '../../services/zone.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface StatusFilter {
  label: string;
  value: ClaimStatus | null;
}

@Component({
  selector: 'app-customer-claims',
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
    ConfirmationDialogComponent,
  ],
  templateUrl: './customer-claims.component.html',
  styleUrl: './customer-claims.component.css',
})
export class CustomerClaimsComponent implements OnInit {
  readonly claims$: Observable<ClaimResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<string | null>;
  readonly submittedCount$: Observable<number>;
  readonly approvedCount$: Observable<number>;
  readonly approvedAmount$: Observable<number>;

  protected readonly filters: StatusFilter[] = [
    { label: 'All', value: null },
    ...CLAIM_STATUSES.map(status => ({
      label: this.statusLabel(status),
      value: status,
    })),
  ];

  protected selectedStatus: ClaimStatus | null = null;

  private zoneNamesById: Record<number, string> = {};
  private readonly actions$ = inject(Actions);
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly store: Store,
    private readonly zoneService: ZoneService,
  ) {
    this.claims$ = this.store.select(selectMyClaims);
    this.loading$ = this.store.select(selectClaimsLoading);
    this.error$ = this.store.select(selectClaimsError);
    this.submittedCount$ = this.store.select(selectMySubmittedClaimCount);
    this.approvedCount$ = this.store.select(selectMyApprovedClaimCount);
    this.approvedAmount$ = this.store.select(selectMyApprovedAmount);
  }

  ngOnInit(): void {
    this.store.dispatch(clearClaimsError());
    this.store.dispatch(loadMyClaims({}));
    // A live claim notification (created, approved, settled…) reloads the list.
    this.actions$
      .pipe(
        ofType(mergeNewNotifications),
        filter(({ notifications }) => notifications.some(n => n.relatedEntityType === 'CLAIM')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() =>
        this.store.dispatch(loadMyClaims({ status: this.selectedStatus ?? undefined })),
      );

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

  protected applyFilter(status: ClaimStatus | null): void {
    this.selectedStatus = status;
    this.store.dispatch(loadMyClaims({
      status: status ?? undefined,
    }));
  }

  protected statusLabel(status: ClaimStatus): string {
    return status
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, character => character.toUpperCase());
  }

  protected incidentLabel(incidentType: string): string {
    return incidentType
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, character => character.toUpperCase());
  }

  /** Submitted claim the customer is about to withdraw. */
  protected cancelTarget: ClaimResponse | null = null;

  protected askCancel(claim: ClaimResponse): void {
    this.store.dispatch(clearClaimsError());
    this.cancelTarget = claim;
  }

  protected confirmCancel(): void {
    if (this.cancelTarget) {
      this.store.dispatch(cancelClaim({ claimId: this.cancelTarget.id }));
    }
    this.cancelTarget = null;
  }

  protected dismissCancel(): void {
    this.cancelTarget = null;
  }
}
