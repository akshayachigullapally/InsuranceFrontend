import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { AdminUserDetailComponent } from './admin-user-detail.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import { UserService } from '../../services/user.service';
import { PolicyService } from '../../services/policy.service';
import { ClaimService } from '../../services/claim.service';
import { ZoneService } from '../../services/zone.service';

type DetailInternals = {
  invalidUserId: boolean;
  loading: boolean;
  error: string | null;
  user: { fullName: string; addresses?: unknown[] } | null;
  policies: unknown[];
  claims: unknown[];
  primaryAddress(): string;
  zoneLabel(zoneId: number): string;
};

const user = {
  id: 7,
  fullName: 'Asha Rao',
  email: 'asha@example.com',
  role: 'ROLE_CUSTOMER',
  addresses: [
    { city: 'Pune', state: 'Maharashtra', country: 'India', primaryAddress: false },
    { city: 'Hyderabad', state: 'Telangana', country: 'India', primaryAddress: true },
  ],
};

const policy = {
  id: 1,
  policyNumber: 'POL-0001',
  productName: 'Rain Cover',
  productCode: 'WEATHER-001',
  locationZoneId: 1,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  sumInsured: 100000,
  premiumAmount: 2500,
  status: 'ACTIVE',
};

function claim(id: number) {
  return {
    id,
    claimNumber: `CLM-000${id}`,
    policyNumber: 'POL-0001',
    locationZoneId: 1,
    incidentType: 'EXCESS_RAINFALL',
    incidentDate: '2026-09-20',
    claimedAmount: 25000,
    status: 'SUBMITTED',
  };
}

async function setup(url: string, userResponse = of(user) as ReturnType<UserService['getUser']>) {
  const services = {
    user: { getUser: vi.fn().mockReturnValue(userResponse) },
    policy: { getAllPolicies: vi.fn().mockReturnValue(of([policy])) },
    claim: { getAllClaims: vi.fn().mockReturnValue(of([claim(2), claim(3)])) },
    zone: { getAllZones: vi.fn().mockReturnValue(of([{ id: 1, zoneName: 'Hyderabad Central Zone' }])) },
  };
  await TestBed.configureTestingModule({
    providers: [
      ...pageTestProviders({}, [{ path: 'admin/users/:userId', component: AdminUserDetailComponent }]),
      { provide: UserService, useValue: services.user },
      { provide: PolicyService, useValue: services.policy },
      { provide: ClaimService, useValue: services.claim },
      { provide: ZoneService, useValue: services.zone },
    ],
  }).compileComponents();

  const harness = await RouterTestingHarness.create();
  const component = await harness.navigateByUrl(url, AdminUserDetailComponent);
  return { page: component as unknown as DetailInternals, services };
}

describe('AdminUserDetailComponent', () => {
  it('flags an invalid user id and loads nothing', async () => {
    const { page, services } = await setup('/admin/users/abc');

    expect(page.invalidUserId).toBe(true);
    expect(services.user.getUser).not.toHaveBeenCalled();
  });

  it('loads the user, their policies and claims', async () => {
    const { page, services } = await setup('/admin/users/7');

    expect(services.user.getUser).toHaveBeenCalledWith(7);
    expect(services.policy.getAllPolicies).toHaveBeenCalledWith(undefined, 7);
    expect(services.claim.getAllClaims).toHaveBeenCalledWith(undefined, 7);
    expect(page.user?.fullName).toBe('Asha Rao');
    expect(page.policies.length).toBe(1);
    expect(page.claims.length).toBe(2);
    expect(page.loading).toBe(false);
  });
});
