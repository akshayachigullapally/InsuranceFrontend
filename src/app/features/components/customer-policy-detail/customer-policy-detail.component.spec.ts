import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { CustomerPolicyDetailComponent } from './customer-policy-detail.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { PolicyService } from '../../services/policy.service';
import { ZoneService } from '../../services/zone.service';
import {
  cancelPolicy,
  clearPoliciesError,
  clearSelectedPolicy,
  loadMyPolicy,
} from '../../state/policies/policies.actions';
import { PolicyResponse } from '../../dtos/policies/policy-response.dto';
import { TriggerCondition } from '../../dtos/triggers/trigger-condition.dto';

type DetailInternals = {
  snapshot: unknown;
  zoneName: string | null;
  cancelOpen: boolean;
  details(policy: PolicyResponse): { label: string; value: string }[];
  snapshotTrigger(): TriggerCondition | null;
  openCancel(): void;
  confirmCancel(): void;
};

const policy = {
  id: 3,
  policyNumber: 'POL-0003',
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
  reviewedAt: null,
  triggerSnapshotId: 40,
} as unknown as PolicyResponse;

const snapshot = {
  perilCode: 'EXCESS_RAINFALL',
  measurementType: 'RAINFALL',
  measurementUnit: 'MM',
  thresholdValue: 150,
  comparisonOperator: 'GREATER_THAN_OR_EQUAL',
};

async function setup(url: string) {
  const policyService = { getPolicySnapshot: vi.fn().mockReturnValue(of(snapshot)) };
  await TestBed.configureTestingModule({
    providers: [
      ...pageTestProviders(
        { policies: { ...mockRootState().policies, selectedPolicy: policy } },
        [{ path: 'customer/policies/:policyId', component: CustomerPolicyDetailComponent }],
      ),
      { provide: PolicyService, useValue: policyService },
      { provide: ZoneService, useValue: { getZone: () => of({ id: 2, zoneName: 'Hyderabad Central Zone' }) } },
    ],
  }).compileComponents();

  const store = TestBed.inject(MockStore);
  vi.spyOn(store, 'dispatch');
  const harness = await RouterTestingHarness.create();
  const component = await harness.navigateByUrl(url, CustomerPolicyDetailComponent);
  return { harness, page: component as unknown as DetailInternals, store, policyService };
}

describe('CustomerPolicyDetailComponent', () => {
  it('does not load anything for an invalid id', async () => {
    const { store } = await setup('/customer/policies/-1');

    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: loadMyPolicy.type }));
  });

  it('loads the policy, its trigger snapshot and zone', async () => {
    const { page, store, policyService } = await setup('/customer/policies/3');

    expect(store.dispatch).toHaveBeenCalledWith(loadMyPolicy({ policyId: 3 }));
    expect(policyService.getPolicySnapshot).toHaveBeenCalledWith(3);
    expect(page.snapshot).toEqual(snapshot);
    expect(page.zoneName).toBe('Hyderabad Central Zone');
  });

  it('builds the detail rows', async () => {
    const { page } = await setup('/customer/policies/3');

    const rows = page.details(policy);

    expect(rows.find((row) => row.label === 'Product')?.value).toBe('Rain Cover (WEATHER-001)');
    expect(rows.find((row) => row.label === 'Term')?.value).toBe('12 months');
    expect(rows.find((row) => row.label === 'Coverage period')?.value).toBe('Jan 1, 2026 to Dec 31, 2026');
    expect(rows.find((row) => row.label === 'Reviewed date')?.value).toBe('Not available');
  });

  it('maps the snapshot to a trigger condition with defaults', async () => {
    const { page } = await setup('/customer/policies/3');

    expect(page.snapshotTrigger()).toEqual(
      expect.objectContaining({
        measurementType: 'RAINFALL',
        thresholdValue: 150,
        aggregationType: 'AVERAGE',
        observationWindowHours: 24,
        minimumObservationCount: 2,
      }),
    );
  });

  it('cancels the policy after confirmation', async () => {
    const { page, store } = await setup('/customer/policies/3');

    page.openCancel();
    expect(store.dispatch).toHaveBeenCalledWith(clearPoliciesError());

    page.confirmCancel();
    expect(store.dispatch).toHaveBeenCalledWith(cancelPolicy({ policyId: 3 }));
  });

  it('clears the selection when leaving the page', async () => {
    const { harness, store } = await setup('/customer/policies/3');

    harness.fixture.destroy();

    expect(store.dispatch).toHaveBeenCalledWith(clearSelectedPolicy());
  });
});
