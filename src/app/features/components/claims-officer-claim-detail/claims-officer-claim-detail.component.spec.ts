import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { ClaimsOfficerClaimDetailComponent } from './claims-officer-claim-detail.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { ProductService } from '../../services/product.service';
import { UserService } from '../../services/user.service';
import { ZoneService } from '../../services/zone.service';
import {
  approveClaim,
  loadReviewClaim,
  rejectClaim,
  startClaimReview,
} from '../../state/claims/claims.actions';
import { ClaimResponse } from '../../dtos/claims/claim-response.dto';

type DetailInternals = {
  approvalForm: FormGroup<{ approvedAmount: FormControl<number | null> }>;
  rejectionForm: FormGroup<{ reason: FormControl<string> }>;
  invalidClaimId: boolean;
  approvalOpen: boolean;
  rejectionOpen: boolean;
  startReviewOpen: boolean;
  customerName: string | null;
  zoneName: string | null;
  openStartReview(): void;
  confirmStartReview(): void;
  openApproval(claim: ClaimResponse): void;
  submitApproval(): void;
  openRejection(): void;
  submitRejection(): void;
  claimedAmount(): number;
  triggerDetails(claim: ClaimResponse): { label: string; value: string }[];
};

const claim: ClaimResponse = {
  id: 8,
  claimNumber: 'CLM-0008',
  customerId: 7,
  policyId: 3,
  policyNumber: 'POL-0003',
  productId: 1,
  triggerEventId: 21,
  triggerEventReference: 'EVT-21',
  perilId: 1,
  locationZoneId: 2,
  incidentType: 'EXCESS_RAINFALL',
  incidentDate: '2026-09-20',
  incidentLocation: 'Gachibowli',
  description: 'Crop damage',
  claimedAmount: 25000,
  approvedAmount: null,
  status: 'UNDER_REVIEW',
  reviewedBy: null,
  submittedAt: '2026-09-21T10:00:00',
  updatedAt: '2026-09-21T10:00:00',
};

async function setup(url: string) {
  await TestBed.configureTestingModule({
    providers: [
      ...pageTestProviders(
        { claims: { ...mockRootState().claims, selectedClaim: claim } },
        [{ path: 'claims-officer/claims/:claimId', component: ClaimsOfficerClaimDetailComponent }],
      ),
      { provide: ZoneService, useValue: { getZone: () => of({ id: 2, zoneName: 'Hyderabad Gachibowli Zone' }) } },
      { provide: UserService, useValue: { getUser: () => of({ id: 7, fullName: 'Asha Rao' }) } },
      { provide: ProductService, useValue: { getProduct: () => of({ id: 1, name: 'Rain Cover', coverages: [] }) } },
    ],
  }).compileComponents();

  const store = TestBed.inject(MockStore);
  vi.spyOn(store, 'dispatch');
  const harness = await RouterTestingHarness.create();
  const component = await harness.navigateByUrl(url, ClaimsOfficerClaimDetailComponent);
  return { page: component as unknown as DetailInternals, store };
}

describe('ClaimsOfficerClaimDetailComponent', () => {
  it('flags an invalid claim id', async () => {
    const { page } = await setup('/claims-officer/claims/-3');

    expect(page.invalidClaimId).toBe(true);
  });

  it('loads the claim and prefills the approval amount', async () => {
    const { page, store } = await setup('/claims-officer/claims/8');

    expect(store.dispatch).toHaveBeenCalledWith(loadReviewClaim({ claimId: 8 }));
    expect(page.approvalForm.controls.approvedAmount.value).toBe(25000);
    expect(page.claimedAmount()).toBe(25000);
    expect(page.customerName).toBe('Asha Rao');
    expect(page.zoneName).toBe('Hyderabad Gachibowli Zone');
  });

  it('starts a review after confirmation', async () => {
    const { page, store } = await setup('/claims-officer/claims/8');

    page.openStartReview();
    page.confirmStartReview();

    expect(page.startReviewOpen).toBe(false);
    expect(store.dispatch).toHaveBeenCalledWith(startClaimReview({ claimId: 8 }));
  });

  it('does not approve more than the claimed amount', async () => {
    const { page, store } = await setup('/claims-officer/claims/8');
    page.openApproval(claim);

    page.approvalForm.controls.approvedAmount.setValue(30000);
    page.submitApproval();

    expect(page.approvalForm.controls.approvedAmount.hasError('max')).toBe(true);
    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: approveClaim.type }));
  });

  it('approves a valid amount', async () => {
    const { page, store } = await setup('/claims-officer/claims/8');
    page.openApproval(claim);

    page.approvalForm.controls.approvedAmount.setValue(18000);
    page.submitApproval();

    expect(page.approvalOpen).toBe(false);
    expect(store.dispatch).toHaveBeenCalledWith(approveClaim({ claimId: 8, approvedAmount: 18000 }));
  });

  it('rejects with a trimmed reason and ignores blank reasons', async () => {
    const { page, store } = await setup('/claims-officer/claims/8');
    page.openRejection();

    page.rejectionForm.controls.reason.setValue('   ');
    page.submitRejection();
    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: rejectClaim.type }));

    page.rejectionForm.controls.reason.setValue(' Duplicate claim ');
    page.submitRejection();
    expect(store.dispatch).toHaveBeenCalledWith(rejectClaim({ claimId: 8, reason: 'Duplicate claim' }));
  });

  it('shows manual-review details for customer reported claims', async () => {
    const { page } = await setup('/claims-officer/claims/8');

    const rows = page.triggerDetails({ ...claim, manualReviewRequired: true });

    expect(rows.some((row) => row.value.includes('manual'))).toBe(true);
  });
});
