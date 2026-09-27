import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { AdminClaimDetailComponent } from './admin-claim-detail.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { PolicyService } from '../../services/policy.service';
import { UserService } from '../../services/user.service';
import { ZoneService } from '../../services/zone.service';
import {
  clearClaimsError,
  clearSelectedClaim,
  loadAdminClaim,
} from '../../state/claims/claims.actions';
import { ClaimResponse } from '../../dtos/claims/claim-response.dto';
import { PolicyResponse } from '../../dtos/policies/policy-response.dto';

type Row = { label: string; value: string };
type DetailInternals = {
  invalidClaimId: boolean;
  policy: PolicyResponse | null;
  customerName: string | null;
  zoneName: string | null;
  claimDetails(claim: ClaimResponse): Row[];
  policyDetails(policy: PolicyResponse): Row[];
  triggerDetails(claim: ClaimResponse): Row[];
  reviewDetails(claim: ClaimResponse): Row[];
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
  triggerDefinitionId: 4,
  perilId: 1,
  locationZoneId: 2,
  incidentType: 'EXCESS_RAINFALL',
  incidentDate: '2026-09-20',
  incidentLocation: 'Gachibowli',
  description: 'Crop damage',
  claimedAmount: 25000,
  approvedAmount: null,
  status: 'SUBMITTED',
  reviewedBy: null,
  submittedAt: '2026-09-21T10:00:00',
  updatedAt: '2026-09-21T10:00:00',
};

const policy = {
  id: 3,
  policyNumber: 'POL-0003',
  productName: 'Rain Cover',
  productCode: 'WEATHER-001',
  status: 'ACTIVE',
  sumInsured: 100000,
  premiumAmount: 2500,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
} as unknown as PolicyResponse;

async function setup(url: string) {
  await TestBed.configureTestingModule({
    providers: [
      ...pageTestProviders(
        { claims: { ...mockRootState().claims, selectedClaim: claim } },
        [{ path: 'admin/claims/:claimId', component: AdminClaimDetailComponent }],
      ),
      { provide: PolicyService, useValue: { getPolicy: vi.fn().mockReturnValue(of(policy)) } },
      { provide: UserService, useValue: { getUser: vi.fn().mockReturnValue(of({ id: 7, fullName: 'Asha Rao' })) } },
      { provide: ZoneService, useValue: { getZone: () => of({ id: 2, zoneName: 'Hyderabad Gachibowli Zone' }) } },
    ],
  }).compileComponents();

  const store = TestBed.inject(MockStore);
  vi.spyOn(store, 'dispatch');
  const harness = await RouterTestingHarness.create();
  const component = await harness.navigateByUrl(url, AdminClaimDetailComponent);
  return { page: component as unknown as DetailInternals, store };
}

describe('AdminClaimDetailComponent', () => {
  it('flags an invalid claim id', async () => {
    const { page } = await setup('/admin/claims/0');

    expect(page.invalidClaimId).toBe(true);
  });

  it('loads the claim with its policy, customer and zone', async () => {
    const { page, store } = await setup('/admin/claims/8');

    expect(store.dispatch).toHaveBeenCalledWith(clearClaimsError());
    expect(store.dispatch).toHaveBeenCalledWith(clearSelectedClaim());
    expect(store.dispatch).toHaveBeenCalledWith(loadAdminClaim({ claimId: 8 }));
    expect(page.policy?.policyNumber).toBe('POL-0003');
    expect(page.customerName).toBe('Asha Rao');
    expect(page.zoneName).toBe('Hyderabad Gachibowli Zone');
  });

  it('builds claim rows with resolved names', async () => {
    const { page } = await setup('/admin/claims/8');

    const rows = page.claimDetails(claim);

    expect(rows.find((row) => row.label === 'Customer')?.value).toBe('Asha Rao (Customer #7)');
    expect(rows.find((row) => row.label === 'Policy')?.value).toBe('POL-0003 (Policy #3)');
    expect(rows.find((row) => row.label === 'Location zone')?.value).toBe('Hyderabad Gachibowli Zone (Zone #2)');
  });

  it('builds policy rows', async () => {
    const { page } = await setup('/admin/claims/8');

    const rows = page.policyDetails(policy);

    expect(rows.find((row) => row.label === 'Product')?.value).toBe('Rain Cover (WEATHER-001)');
    expect(rows.find((row) => row.label === 'Coverage end')?.value).toBe('Dec 31, 2026');
  });

  it('builds trigger and review rows', async () => {
    const { page } = await setup('/admin/claims/8');

    const trigger = page.triggerDetails(claim);
    expect(trigger.find((row) => row.label === 'Trigger definition ID')?.value).toBe('Definition #4');

    const review = page.reviewDetails(claim);
    expect(review.find((row) => row.label === 'Reviewed by')?.value).toBe('Not reviewed');
    expect(review.find((row) => row.label === 'Approved amount')?.value).toBe('Not approved');
  });
});
