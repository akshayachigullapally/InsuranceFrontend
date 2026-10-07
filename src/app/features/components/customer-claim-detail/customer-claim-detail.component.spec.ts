import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { CustomerClaimDetailComponent } from './customer-claim-detail.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { ZoneService } from '../../services/zone.service';
import {
  loadMyClaim,
} from '../../state/claims/claims.actions';
import { ClaimResponse } from '../../dtos/claims/claim-response.dto';

type DetailInternals = {
  invalidClaimId: boolean;
  zoneName: string | null;
  cancelOpen: boolean;
  claimDetails(claim: ClaimResponse): { label: string; value: string }[];
  triggerDetails(claim: ClaimResponse): { label: string; value: string }[];
  openCancel(): void;
  confirmCancel(): void;
  dismissCancel(): void;
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
  status: 'SUBMITTED',
  submittedAt: '2026-09-21T10:00:00',
  updatedAt: '2026-09-21T10:00:00',
};

async function setup(url: string) {
  await TestBed.configureTestingModule({
    providers: [
      ...pageTestProviders(
        { claims: { ...mockRootState().claims, selectedClaim: claim } },
        [{ path: 'customer/claims/:claimId', component: CustomerClaimDetailComponent }],
      ),
      { provide: ZoneService, useValue: { getZone: vi.fn().mockReturnValue(of({ id: 2, zoneName: 'Hyderabad Gachibowli Zone' })) } },
    ],
  }).compileComponents();

  const store = TestBed.inject(MockStore);
  vi.spyOn(store, 'dispatch');
  const harness = await RouterTestingHarness.create();
  const component = await harness.navigateByUrl(url, CustomerClaimDetailComponent);
  return { harness, page: component as unknown as DetailInternals, store };
}

describe('CustomerClaimDetailComponent', () => {
  it('flags an invalid claim id', async () => {
    const { page, store } = await setup('/customer/claims/abc');

    expect(page.invalidClaimId).toBe(true);
    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: loadMyClaim.type }));
  });

  it('shows trigger details for automatic claims and evidence for manual ones', async () => {
    const { page } = await setup('/customer/claims/8');

    const automatic = page.triggerDetails(claim);
    expect(automatic.find((row) => row.label === 'Trigger event')?.value).toBe('EVT-21');
    expect(automatic.find((row) => row.label === 'Location zone')?.value).toBe('Hyderabad Gachibowli Zone (Zone #2)');

    const manual = page.triggerDetails({ ...claim, manualReviewRequired: true, evidenceDescription: 'Photos attached' });
    expect(manual.map((row) => row.value)).toEqual(['Customer reported (manual)', 'Photos attached']);
  });
});
