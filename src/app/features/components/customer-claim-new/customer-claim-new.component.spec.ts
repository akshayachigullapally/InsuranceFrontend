import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { CustomerClaimNewComponent } from './customer-claim-new.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { PolicyService } from '../../services/policy.service';
import { ZoneService } from '../../services/zone.service';
import { clearClaimsError, createClaim } from '../../state/claims/claims.actions';
import { clearPoliciesError, loadMyPolicies } from '../../state/policies/policies.actions';

type ClaimNewInternals = {
  selectedPolicy: { id: number } | null;
  descriptionLength: number;
  snapshot: unknown;
  onSubmit(): void;
  zoneLabel(zoneId: number): string;
};

const policies = [
  { id: 3, policyNumber: 'POL-0003', status: 'ACTIVE', sumInsured: 50000, locationZoneId: 2, triggerSnapshotId: 40 },
  { id: 4, policyNumber: 'POL-0004', status: 'ACTIVE', sumInsured: 80000, locationZoneId: 2, triggerSnapshotId: null },
];

async function setup(url = '/customer/claims/new') {
  const policyService = { getPolicySnapshot: vi.fn().mockReturnValue(of({ measurementType: 'RAINFALL', thresholdValue: 150 })) };
  await TestBed.configureTestingModule({
    providers: [
      ...pageTestProviders(
        { policies: { ...mockRootState().policies, myPolicies: policies } },
        [{ path: 'customer/claims/new', component: CustomerClaimNewComponent }],
      ),
      { provide: ZoneService, useValue: { getActiveZones: () => of([{ id: 2, zoneName: 'Hyderabad Central Zone' }]) } },
      { provide: PolicyService, useValue: policyService },
    ],
  }).compileComponents();

  const store = TestBed.inject(MockStore);
  vi.spyOn(store, 'dispatch');
  const harness = await RouterTestingHarness.create();
  const component = await harness.navigateByUrl(url, CustomerClaimNewComponent);
  return { component, page: component as unknown as ClaimNewInternals, store, policyService };
}

function fillValidClaim(component: CustomerClaimNewComponent): void {
  component.form.patchValue({
    policyId: 4,
    incidentType: ' crop_loss ',
    incidentDate: '2026-01-15',
    incidentLocation: ' Gachibowli ',
    description: ' Heavy rain destroyed the crop ',
    claimedAmount: 20000,
  });
}

describe('CustomerClaimNewComponent', () => {
  it('loads active policies on init', async () => {
    const { store } = await setup();

    expect(store.dispatch).toHaveBeenCalledWith(clearPoliciesError());
    expect(store.dispatch).toHaveBeenCalledWith(clearClaimsError());
    expect(store.dispatch).toHaveBeenCalledWith(loadMyPolicies({ status: 'ACTIVE' }));
  });

  it('preselects the policy from the query string and loads its snapshot', async () => {
    const { component, page, policyService } = await setup('/customer/claims/new?policyId=3');

    expect(component.form.controls.policyId.value).toBe(3);
    expect(page.selectedPolicy?.id).toBe(3);
    expect(component.form.controls.claimedAmount.value).toBe(50000);
    expect(policyService.getPolicySnapshot).toHaveBeenCalledWith(3);
  });

  it('limits the claimed amount to the sum insured', async () => {
    const { component } = await setup();
    component.form.controls.policyId.setValue(4);

    component.form.controls.claimedAmount.setValue(90000);

    expect(component.form.controls.claimedAmount.hasError('max')).toBe(true);
  });

  it('tracks the description length', async () => {
    const { component, page } = await setup();

    component.form.controls.description.setValue('12345');

    expect(page.descriptionLength).toBe(5);
  });

  it('does not submit an incomplete form', async () => {
    const { page, store } = await setup();

    page.onSubmit();

    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: createClaim.type }));
  });

  it('rejects an incident date in the future', async () => {
    const { component, page, store } = await setup();
    fillValidClaim(component);
    component.form.controls.incidentDate.setValue('2999-01-01');

    page.onSubmit();

    expect(component.form.controls.incidentDate.hasError('futureDate')).toBe(true);
    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: createClaim.type }));
  });

  it('submits a normalised manual claim', async () => {
    const { component, page, store } = await setup();
    fillValidClaim(component);

    page.onSubmit();

    expect(store.dispatch).toHaveBeenCalledWith(
      createClaim({
        request: {
          policyId: 4,
          incidentType: 'CROP_LOSS',
          incidentDate: '2026-01-15',
          incidentLocation: 'Gachibowli',
          description: 'Heavy rain destroyed the crop',
          claimedAmount: 20000,
          claimSource: 'MANUAL_EXCEPTION',
          customerConfirmedLoss: true,
          evidenceDescription: 'Heavy rain destroyed the crop',
        },
      }),
    );
  });

  it('labels zones by name', async () => {
    const { page } = await setup();

    expect(page.zoneLabel(2)).toBe('Hyderabad Central Zone (Zone #2)');
  });
});
