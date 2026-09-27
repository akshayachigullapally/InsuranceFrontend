import { TestBed } from '@angular/core/testing';
import { FormGroup, FormControl } from '@angular/forms';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { UnderwriterPolicyDetailComponent } from './underwriter-policy-detail.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { PolicyService } from '../../services/policy.service';
import { ProductService } from '../../services/product.service';
import { UserService } from '../../services/user.service';
import { ZoneService } from '../../services/zone.service';
import {
  approvePolicy,
  clearPoliciesError,
  loadAdminPolicy,
  rejectPolicy,
} from '../../state/policies/policies.actions';
import { PolicyResponse } from '../../dtos/policies/policy-response.dto';

type DetailInternals = {
  rejectionForm: FormGroup<{ reason: FormControl<string> }>;
  invalidPolicyId: boolean;
  approveOpen: boolean;
  rejectOpen: boolean;
  zoneName: string | null;
  customerName: string | null;
  product: { name: string } | null;
  openApproval(): void;
  confirmApproval(): void;
  openRejection(): void;
  submitRejection(): void;
  dismissRejection(): void;
  reasonLength(): number;
};

const policy = {
  id: 3,
  policyNumber: 'POL-0003',
  customerId: 7,
  productId: 1,
  productName: 'Rain Cover',
  productCode: 'WEATHER-001',
  status: 'PENDING',
  sumInsured: 100000,
  premiumAmount: 2500,
  termMonths: 12,
  locationZoneId: 2,
  createdAt: '2026-09-20T10:00:00',
  triggerSnapshotId: null,
} as unknown as PolicyResponse;

async function setup(url: string) {
  await TestBed.configureTestingModule({
    providers: [
      ...pageTestProviders(
        { policies: { ...mockRootState().policies, selectedPolicy: policy } },
        [{ path: 'underwriter/policies/:policyId', component: UnderwriterPolicyDetailComponent }],
      ),
      { provide: ZoneService, useValue: { getZone: () => of({ id: 2, zoneName: 'Hyderabad Central Zone' }) } },
      { provide: UserService, useValue: { getUser: () => of({ id: 7, fullName: 'Asha Rao' }) } },
      { provide: ProductService, useValue: { getProduct: () => of({ id: 1, name: 'Rain Cover', coverages: [] }) } },
      { provide: PolicyService, useValue: { getPolicySnapshot: vi.fn().mockReturnValue(of({})) } },
    ],
  }).compileComponents();

  const store = TestBed.inject(MockStore);
  vi.spyOn(store, 'dispatch');
  const harness = await RouterTestingHarness.create();
  const component = await harness.navigateByUrl(url, UnderwriterPolicyDetailComponent);
  return { page: component as unknown as DetailInternals, store };
}

describe('UnderwriterPolicyDetailComponent', () => {
  it('flags an invalid policy id', async () => {
    const { page } = await setup('/underwriter/policies/abc');

    expect(page.invalidPolicyId).toBe(true);
  });

  it('loads the policy with zone, customer and product', async () => {
    const { page, store } = await setup('/underwriter/policies/3');

    expect(store.dispatch).toHaveBeenCalledWith(loadAdminPolicy({ policyId: 3 }));
    expect(page.zoneName).toBe('Hyderabad Central Zone');
    expect(page.customerName).toBe('Asha Rao');
    expect(page.product?.name).toBe('Rain Cover');
  });

  it('approves the policy after confirmation', async () => {
    const { page, store } = await setup('/underwriter/policies/3');

    page.openApproval();
    expect(page.approveOpen).toBe(true);
    expect(store.dispatch).toHaveBeenCalledWith(clearPoliciesError());

    page.confirmApproval();
    expect(page.approveOpen).toBe(false);
    expect(store.dispatch).toHaveBeenCalledWith(approvePolicy({ policyId: 3 }));
  });

  it('requires a non-blank rejection reason', async () => {
    const { page, store } = await setup('/underwriter/policies/3');
    page.openRejection();

    page.rejectionForm.controls.reason.setValue('   ');
    page.submitRejection();

    expect(page.rejectOpen).toBe(true);
    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: rejectPolicy.type }));
  });

  it('rejects the policy with a trimmed reason', async () => {
    const { page, store } = await setup('/underwriter/policies/3');
    page.openRejection();

    page.rejectionForm.controls.reason.setValue('  Zone is flood prone  ');
    expect(page.reasonLength()).toBe(23);
    page.submitRejection();

    expect(page.rejectOpen).toBe(false);
    expect(store.dispatch).toHaveBeenCalledWith(rejectPolicy({ policyId: 3, reason: 'Zone is flood prone' }));
  });

  it('resets the rejection form when dismissed', async () => {
    const { page } = await setup('/underwriter/policies/3');
    page.openRejection();
    page.rejectionForm.controls.reason.setValue('draft');

    page.dismissRejection();

    expect(page.rejectOpen).toBe(false);
    expect(page.rejectionForm.controls.reason.value).toBe('');
  });
});
