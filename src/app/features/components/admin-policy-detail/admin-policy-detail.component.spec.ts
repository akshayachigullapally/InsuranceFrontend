import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { AdminPolicyDetailComponent } from './admin-policy-detail.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { PolicyService } from '../../services/policy.service';
import { UserService } from '../../services/user.service';
import { ZoneService } from '../../services/zone.service';
import {
  clearPoliciesError,
  clearSelectedPolicy,
  loadAdminPolicy,
} from '../../state/policies/policies.actions';
import { PolicyResponse } from '../../dtos/policies/policy-response.dto';

type DetailInternals = {
  invalidPolicyId: boolean;
  customerName: string | null;
  reviewerName: string | null;
  zoneName: string | null;
  snapshot: unknown;
  details(policy: PolicyResponse): { label: string; value: string }[];
};

const policy = {
  id: 3,
  policyNumber: 'POL-0003',
  customerId: 7,
  productId: 1,
  productName: 'Rain Cover',
  productCode: 'WEATHER-001',
  status: 'ACTIVE',
  sumInsured: 100000,
  premiumAmount: 2500,
  termMonths: 12,
  locationZoneId: 2,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  createdAt: '2025-12-20T10:00:00',
  updatedAt: '2025-12-21T10:00:00',
  reviewedBy: 9,
  reviewedAt: '2025-12-21T10:00:00',
  triggerSnapshotId: null,
} as unknown as PolicyResponse;

async function setup(url: string) {
  const policyService = { getPolicySnapshot: vi.fn().mockReturnValue(of({})) };
  const userService = {
    getUser: vi.fn((id: number) => of({ id, fullName: id === 7 ? 'Asha Rao' : 'Uma Underwriter' })),
  };
  await TestBed.configureTestingModule({
    providers: [
      ...pageTestProviders(
        { policies: { ...mockRootState().policies, selectedPolicy: policy } },
        [{ path: 'admin/policies/:policyId', component: AdminPolicyDetailComponent }],
      ),
      { provide: PolicyService, useValue: policyService },
      { provide: UserService, useValue: userService },
      { provide: ZoneService, useValue: { getZone: () => of({ id: 2, zoneName: 'Hyderabad Central Zone' }) } },
    ],
  }).compileComponents();

  const store = TestBed.inject(MockStore);
  vi.spyOn(store, 'dispatch');
  const harness = await RouterTestingHarness.create();
  const component = await harness.navigateByUrl(url, AdminPolicyDetailComponent);
  return { page: component as unknown as DetailInternals, store, policyService, userService };
}

describe('AdminPolicyDetailComponent', () => {
  it('flags an invalid policy id', async () => {
    const { page } = await setup('/admin/policies/x');

    expect(page.invalidPolicyId).toBe(true);
  });

  it('loads the policy with customer, reviewer and zone names', async () => {
    const { page, store, userService } = await setup('/admin/policies/3');

    expect(store.dispatch).toHaveBeenCalledWith(clearPoliciesError());
    expect(store.dispatch).toHaveBeenCalledWith(clearSelectedPolicy());
    expect(store.dispatch).toHaveBeenCalledWith(loadAdminPolicy({ policyId: 3 }));
    expect(userService.getUser).toHaveBeenCalledWith(7);
    expect(userService.getUser).toHaveBeenCalledWith(9);
    expect(page.customerName).toBe('Asha Rao');
    expect(page.reviewerName).toBe('Uma Underwriter');
    expect(page.zoneName).toBe('Hyderabad Central Zone');
  });
});
