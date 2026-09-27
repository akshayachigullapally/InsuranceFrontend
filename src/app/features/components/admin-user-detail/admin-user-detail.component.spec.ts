import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
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

async function setup(url: string, userResponse = of(user) as ReturnType<UserService['getUser']>) {
  const services = {
    user: { getUser: vi.fn().mockReturnValue(userResponse) },
    policy: { getAllPolicies: vi.fn().mockReturnValue(of([{ id: 1 }])) },
    claim: { getAllClaims: vi.fn().mockReturnValue(of([{ id: 2 }, { id: 3 }])) },
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

  it('shows the primary address', async () => {
    const { page } = await setup('/admin/users/7');

    expect(page.primaryAddress()).toBe('Hyderabad, Telangana, India');
  });

  it('shows a placeholder when there is no address', async () => {
    const { page } = await setup('/admin/users/7', of({ ...user, addresses: [] }));

    expect(page.primaryAddress()).toBe('No address on file');
  });

  it('shows an error when the user cannot be loaded', async () => {
    const { page } = await setup('/admin/users/7', throwError(() => new Error('404')));

    expect(page.error).toBe('Failed to load user details.');
  });

  it('labels zones by name', async () => {
    const { page } = await setup('/admin/users/7');

    expect(page.zoneLabel(1)).toBe('Hyderabad Central Zone (Zone #1)');
  });
});
