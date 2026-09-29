import { TriggerExplanationComponent } from '../../../shared/components/trigger-explanation/trigger-explanation.component';
import { ClaimDocumentsComponent } from '../../../shared/components/claim-documents/claim-documents.component';
import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClaimResponse } from '../../dtos/claims/claim-response.dto';
import { ProductResponse } from '../../dtos/products/product-response.dto';
import {
  approveClaim,
  clearClaimsError,
  clearSelectedClaim,
  loadReviewClaim,
  rejectClaim,
  settleClaim,
  startClaimReview,
} from '../../state/claims/claims.actions';
import {
  selectClaimsError,
  selectClaimsLoading,
  selectClaimsSaving,
  selectSelectedClaim,
} from '../../state/claims/claims.selectors';
import { ProductService } from '../../services/product.service';
import { UserService } from '../../services/user.service';
import { PerilService } from '../../services/peril.service';
import { TriggerEventService } from '../../services/trigger-event.service';
import { ZoneService } from '../../services/zone.service';
import { parseLocalDateOnly } from '../../utils/local-date.util';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface DetailRow {
  label: string;
  value: string;
}

interface ApprovalForm {
  approvedAmount: FormControl<number | null>;
}

interface RejectionForm {
  reason: FormControl<string>;
}

@Component({
  selector: 'app-claims-officer-claim-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    ConfirmationDialogComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    TriggerExplanationComponent,
    ClaimDocumentsComponent,
  ],
  providers: [DatePipe],
  templateUrl: './claims-officer-claim-detail.component.html',
  styleUrl: './claims-officer-claim-detail.component.css',
})
export class ClaimsOfficerClaimDetailComponent implements OnInit, OnDestroy {
  readonly claim$: Observable<ClaimResponse | null>;
  readonly loading$: Observable<boolean>;
  readonly saving$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  readonly approvalForm = new FormGroup<ApprovalForm>({
    approvedAmount: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
    ]),
  });

  readonly rejectionForm = new FormGroup<RejectionForm>({
    reason: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500), Validators.pattern(/\S+/)],
    }),
  });

  protected startReviewOpen = false;
  protected settleOpen = false;
  protected approvalOpen = false;
  protected rejectionOpen = false;
  protected invalidClaimId = false;

  protected zoneName: string | null = null;
  protected customerName: string | null = null;
  protected reviewerName: string | null = null;
  protected product: ProductResponse | null = null;
  protected productLoading = false;
  protected definitionLabel: string | null = null;
  protected perilLabel: string | null = null;

  private claimId = 0;
  private selectedClaim: ClaimResponse | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store,
    private readonly datePipe: DatePipe,
    private readonly zoneService: ZoneService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly triggerEventService: TriggerEventService,
    private readonly perilService: PerilService,
  ) {
    this.claim$ = this.store.select(selectSelectedClaim);
    this.loading$ = this.store.select(selectClaimsLoading);
    this.saving$ = this.store.select(selectClaimsSaving);
    this.error$ = this.store.select(selectClaimsError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearClaimsError());
    this.store.dispatch(clearSelectedClaim());

    const claimId = Number(this.route.snapshot.paramMap.get('claimId'));

    if (!Number.isInteger(claimId) || claimId <= 0) {
      this.invalidClaimId = true;
      return;
    }

    this.claimId = claimId;
    this.store.dispatch(loadReviewClaim({ claimId }));

    this.claim$.pipe(takeUntil(this.destroy$)).subscribe((claim) => {
      this.selectedClaim = claim;

      if (claim && this.approvalForm.controls.approvedAmount.value === null) {
        this.approvalForm.controls.approvedAmount.setValue(claim.claimedAmount);
      }

      if (claim) {
        this.approvalForm.controls.approvedAmount.setValidators([
          Validators.required,
          Validators.min(0.01),
          Validators.max(claim.claimedAmount),
        ]);

        this.approvalForm.controls.approvedAmount.updateValueAndValidity({ emitEvent: false });

        this.loadZone(claim.locationZoneId);
        this.loadCustomer(claim.customerId);
        this.loadProduct(claim.productId);
        this.loadTriggerDefinition(claim.triggerDefinitionId);
        this.loadPeril(claim.perilId);

        if (claim.reviewedBy) {
          this.loadReviewer(claim.reviewedBy);
        } else {
          this.reviewerName = null;
        }
      }
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
        next: (zone) => {
          this.zoneName = zone.zoneName;
        },
        error: () => {
          this.zoneName = null;
        },
      });
  }

  private loadCustomer(customerId: number): void {
    this.userService
      .getUser(customerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.customerName = user.fullName;
        },
        error: () => {
          this.customerName = null;
        },
      });
  }

  private loadReviewer(reviewerId: number): void {
    this.userService
      .getUser(reviewerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.reviewerName = user.fullName;
        },
        error: () => {
          this.reviewerName = null;
        },
      });
  }

  private loadProduct(productId: number): void {
    this.productLoading = true;

    this.productService
      .getProduct(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          this.product = product;
          this.productLoading = false;
        },
        error: () => {
          this.product = null;
          this.productLoading = false;
        },
      });
  }

  private loadTriggerDefinition(definitionId: number | null | undefined): void {
    this.definitionLabel = null;
    if (!definitionId) return;

    this.triggerEventService
      .getTriggerDefinition(definitionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (definition) =>
          (this.definitionLabel = `${definition.definitionCode} · ${definition.definitionName}`),
        error: () => (this.definitionLabel = `Definition #${definitionId}`),
      });
  }

  private loadPeril(perilId: number | null | undefined): void {
    this.perilLabel = null;
    if (!perilId) return;

    this.perilService
      .getPeril(perilId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (peril) => (this.perilLabel = `${peril.perilName} (${peril.perilCode})`),
        error: () => (this.perilLabel = `Peril #${perilId}`),
      });
  }

  protected claimDetails(claim: ClaimResponse): DetailRow[] {
    return [
      {
        label: 'Customer',
        value: this.customerName
          ? `${this.customerName} (Customer #${claim.customerId})`
          : `Customer #${claim.customerId}`,
      },
      {
        label: 'Policy',
        value: `${claim.policyNumber} (#${claim.policyId})`,
      },
      {
        label: 'Product ID',
        value: `Product #${claim.productId}`,
      },
      {
        label: 'Location zone',
        value: this.zoneName
          ? `${this.zoneName} (Zone #${claim.locationZoneId})`
          : `Zone #${claim.locationZoneId}`,
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
        label: 'Submitted',
        value: this.formatDateTime(claim.submittedAt),
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
          label: 'Trigger validation',
          value: 'Pending officer decision',
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
        value: `Event #${claim.triggerEventId}`,
      },
      {
        label: 'Trigger reference',
        value: claim.triggerEventReference ?? 'Not available',
      },
      {
        label: 'Trigger definition',
        value: claim.triggerDefinitionId
          ? (this.definitionLabel ?? `Definition #${claim.triggerDefinitionId}`)
          : 'Recorded directly from a current measurement',
      },
      {
        label: 'Peril',
        value: claim.perilId
          ? (this.perilLabel ?? `Peril #${claim.perilId}`)
          : (this.product?.perilCode?.replaceAll('_', ' ') ?? 'Not available'),
      },
    ];
  }

  protected reviewDetails(claim: ClaimResponse): DetailRow[] {
    return [
      {
        label: 'Reviewed by',
        value: claim.reviewedBy
          ? this.reviewerName
            ? `${this.reviewerName} (User #${claim.reviewedBy})`
            : `User #${claim.reviewedBy}`
          : 'Not assigned',
      },
      {
        label: 'Review started',
        value: this.formatDateTime(claim.reviewedAt),
      },
      {
        label: 'Last updated',
        value: this.formatDateTime(claim.updatedAt),
      },
      {
        label: 'Approved amount',
        value:
          claim.approvedAmount !== null && claim.approvedAmount !== undefined
            ? this.formatCurrency(claim.approvedAmount)
            : 'Not decided',
      },
    ];
  }

  protected openStartReview(): void {
    this.store.dispatch(clearClaimsError());
    this.startReviewOpen = true;
  }

  protected confirmStartReview(): void {
    if (this.claimId <= 0) return;

    this.startReviewOpen = false;
    this.store.dispatch(
      startClaimReview({
        claimId: this.claimId,
      }),
    );
  }

  protected dismissStartReview(): void {
    this.startReviewOpen = false;
  }

  protected openSettle(): void {
    this.store.dispatch(clearClaimsError());
    this.settleOpen = true;
  }

  protected confirmSettle(): void {
    if (this.claimId <= 0) return;

    this.settleOpen = false;
    this.store.dispatch(
      settleClaim({
        claimId: this.claimId,
        notes: 'Settled manually by claims officer',
      }),
    );
  }

  protected dismissSettle(): void {
    this.settleOpen = false;
  }

  protected openApproval(claim: ClaimResponse): void {
    this.store.dispatch(clearClaimsError());

    this.approvalForm.controls.approvedAmount.setValidators([
      Validators.required,
      Validators.min(0.01),
      Validators.max(claim.claimedAmount),
    ]);

    this.approvalForm.controls.approvedAmount.setValue(claim.claimedAmount);

    this.approvalForm.controls.approvedAmount.updateValueAndValidity();

    this.approvalOpen = true;
  }

  protected submitApproval(): void {
    if (this.approvalForm.invalid || this.claimId <= 0) {
      this.approvalForm.markAllAsTouched();
      return;
    }

    const approvedAmount = this.approvalForm.controls.approvedAmount.value;

    if (approvedAmount === null) return;

    this.approvalOpen = false;

    this.store.dispatch(
      approveClaim({
        claimId: this.claimId,
        approvedAmount,
      }),
    );
  }

  protected dismissApproval(): void {
    this.approvalOpen = false;
  }

  protected openRejection(): void {
    this.store.dispatch(clearClaimsError());
    this.rejectionForm.reset();
    this.rejectionOpen = true;
  }

  protected submitRejection(): void {
    if (this.rejectionForm.invalid || this.claimId <= 0) {
      this.rejectionForm.markAllAsTouched();
      return;
    }

    const reason = this.rejectionForm.controls.reason.value.trim();

    if (!reason) {
      this.rejectionForm.controls.reason.setErrors({
        required: true,
      });
      return;
    }

    this.rejectionOpen = false;

    this.store.dispatch(
      rejectClaim({
        claimId: this.claimId,
        reason,
      }),
    );
  }

  protected dismissRejection(): void {
    this.rejectionOpen = false;
    this.rejectionForm.reset();
  }

  protected rejectionReasonLength(): number {
    return this.rejectionForm.controls.reason.value.length;
  }

  protected claimedAmount(): number {
    return this.selectedClaim?.claimedAmount ?? 0;
  }

  private label(value: string): string {
    return value
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (character) => character.toUpperCase());
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

    return this.datePipe.transform(date, 'mediumDate') ?? 'Not available';
  }

  private formatDateTime(value?: string | null): string {
    if (!value) return 'Not available';

    return this.datePipe.transform(value, 'medium') ?? 'Not available';
  }
}
