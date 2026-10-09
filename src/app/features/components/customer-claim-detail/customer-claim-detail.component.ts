import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { mergeNewNotifications } from '../../state/notifications/notifications.actions';
import { ClaimResponse } from '../../dtos/claims/claim-response.dto';
import {
  cancelClaim,
  clearClaimsError,
  clearSelectedClaim,
  loadMyClaim,
} from '../../state/claims/claims.actions';
import {
  selectClaimsError,
  selectClaimsLoading,
  selectClaimsSaving,
  selectSelectedClaim,
} from '../../state/claims/claims.selectors';
import { ZoneService } from '../../services/zone.service';
import { parseLocalDateOnly } from '../../utils/local-date.util';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { TriggerExplanationComponent } from '../../../shared/components/trigger-explanation/trigger-explanation.component';
import { ClaimDocumentsComponent } from '../../../shared/components/claim-documents/claim-documents.component';

interface DetailRow {
  label: string;
  value: string;
}

@Component({
  selector: 'app-customer-claim-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    DecimalPipe,
    RouterLink,
    ConfirmationDialogComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    TriggerExplanationComponent,
    ClaimDocumentsComponent,
  ],
  providers: [DatePipe],
  templateUrl: './customer-claim-detail.component.html',
  styleUrl: './customer-claim-detail.component.css',
})
export class CustomerClaimDetailComponent implements OnInit, OnDestroy {
  readonly claim$: Observable<ClaimResponse | null>;
  readonly loading$: Observable<boolean>;
  readonly saving$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  protected cancelOpen = false;
  protected invalidClaimId = false;
  protected zoneName: string | null = null;
  /** Set when evidence files failed to upload right after the claim was created. */
  protected uploadWarning: string | null = null;

  private claimId = 0;
  private readonly destroy$ = new Subject<void>();
  private readonly actions$ = inject(Actions);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store,
    private readonly datePipe: DatePipe,
    private readonly zoneService: ZoneService,
  ) {
    this.claim$ = this.store.select(selectSelectedClaim);
    this.loading$ = this.store.select(selectClaimsLoading);
    this.saving$ = this.store.select(selectClaimsSaving);
    this.error$ = this.store.select(selectClaimsError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearClaimsError());
    this.store.dispatch(clearSelectedClaim());

    const claimId = Number(
      this.route.snapshot.paramMap.get('claimId'),
    );

    if (!Number.isInteger(claimId) || claimId <= 0) {
      this.invalidClaimId = true;
      return;
    }

    this.claimId = claimId;
    this.uploadWarning =
      (globalThis.history?.state as { uploadError?: string } | undefined)?.uploadError ?? null;
    this.store.dispatch(loadMyClaim({ claimId }));
    // A live notification about this claim (approved, settled…) reloads it.
    this.actions$
      .pipe(
        ofType(mergeNewNotifications),
        filter(({ notifications }) =>
          notifications.some(n => n.relatedEntityType === 'CLAIM' && n.relatedEntityId === claimId),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.store.dispatch(loadMyClaim({ claimId })));

    this.claim$
      .pipe(takeUntil(this.destroy$))
      .subscribe(claim => {
        if (!claim || claim.id !== claimId) {
          return;
        }

        this.loadZone(claim.locationZoneId);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearSelectedClaim());
    this.store.dispatch(clearClaimsError());
  }

  private loadZone(locationZoneId: number): void {
    this.zoneService
      .getZone(locationZoneId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: zone => {
          this.zoneName = zone.zoneName;
        },
        error: () => {
          this.zoneName = null;
        },
      });
  }

  protected claimDetails(claim: ClaimResponse): DetailRow[] {
    return [
      {
        label: 'Policy number',
        value: claim.policyNumber,
      },
      {
        label: 'Incident type',
        value: this.label(claim.incidentType),
      },
      {
        label: 'Incident date',
        value: this.formatDateOnly(claim.incidentDate),
      },
      {
        label: 'Incident location',
        value: claim.incidentLocation,
      },
      {
        label: 'Claimed amount',
        value: this.formatCurrency(claim.claimedAmount),
      },
      {
        label: 'Approved amount',
        value:
          claim.approvedAmount !== null &&
          claim.approvedAmount !== undefined
            ? this.formatCurrency(claim.approvedAmount)
            : 'Not decided',
      },
      {
        label: 'Submitted',
        value: this.formatDateTime(claim.submittedAt),
      },
      {
        label: 'Last updated',
        value: this.formatDateTime(claim.updatedAt),
      },
    ];
  }

  protected triggerDetails(claim: ClaimResponse): DetailRow[] {
    if (claim.manualReviewRequired) {
      return [
        {
          label: 'Claim source',
          value: 'Customer reported (manual)',
        },
        {
          label: 'Evidence',
          value: claim.evidenceDescription ?? 'Not provided',
        },
      ];
    }

    return [
      {
        label: 'Trigger event',
        value: claim.triggerEventReference ?? 'Not available',
      },
      {
        label: 'Trigger event ID',
        value: claim.triggerEventId != null
          ? `Event #${claim.triggerEventId}`
          : 'Not available',
      },
      {
        label: 'Location zone',
        value: this.zoneName
          ? `${this.zoneName} (Zone #${claim.locationZoneId})`
          : `Zone #${claim.locationZoneId}`,
      },
      {
        label: 'Peril ID',
        value: claim.perilId
          ? `Peril #${claim.perilId}`
          : 'Not available',
      },
    ];
  }

  protected openCancel(): void {
    this.store.dispatch(clearClaimsError());
    this.cancelOpen = true;
  }

  protected confirmCancel(): void {
    if (this.claimId <= 0) return;

    this.cancelOpen = false;
    this.store.dispatch(cancelClaim({
      claimId: this.claimId,
    }));
  }

  protected dismissCancel(): void {
    this.cancelOpen = false;
  }

  private label(value: string): string {
    return value
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, character => character.toUpperCase());
  }

  private formatCurrency(value: number): string {
    return `₹ ${value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  protected formatDateOnly(value?: string | null): string {
    const date = parseLocalDateOnly(value);

    if (!date) return 'Not available';

    return this.datePipe.transform(
      date,
      'mediumDate',
    ) ?? 'Not available';
  }

  private formatDateTime(value?: string | null): string {
    if (!value) return 'Not available';

    return this.datePipe.transform(
      value,
      'medium',
    ) ?? 'Not available';
  }

  protected canAddDocuments(claim: ClaimResponse): boolean {
    return claim.status === 'SUBMITTED' || claim.status === 'UNDER_REVIEW';
  }
}
