import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { firstValueFrom } from 'rxjs';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { loadUsers } from '../../state/users/users.actions';
import { loadAdminPolicies } from '../../state/policies/policies.actions';
import { loadAdminProducts } from '../../state/products/products.actions';
import { loadPayouts } from '../../state/payouts/payouts.actions';

describe('AdminDashboardComponent', () => {
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let store: MockStore;

  beforeEach(async () => {
    const root = mockRootState();
    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: pageTestProviders({
        users: { ...root.users, users: [{ id: 1 }, { id: 2 }, { id: 3 }] },
        policies: {
          ...root.policies,
          adminPolicies: [{ id: 1, status: 'ACTIVE' }, { id: 2, status: 'PENDING' }],
        },
      }),
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(AdminDashboardComponent);
    fixture.detectChanges();
  });

  it('loads users, policies, products and payouts on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(loadUsers({}));
    expect(store.dispatch).toHaveBeenCalledWith(loadAdminPolicies({}));
    expect(store.dispatch).toHaveBeenCalledWith(loadAdminProducts());
    expect(store.dispatch).toHaveBeenCalledWith(loadPayouts());
  });

  it('exposes counts from the store', async () => {
    expect(await firstValueFrom(fixture.componentInstance.userCount$)).toBe(3);
    expect(await firstValueFrom(fixture.componentInstance.activePolicyCount$)).toBe(1);
  });

  it('renders a card link for every admin area', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('a[href="/admin/zones"]')).not.toBeNull();
    expect(element.querySelector('a[href="/admin/perils"]')).not.toBeNull();
    expect(element.querySelector('a[href="/admin/pricing-rules"]')).not.toBeNull();
  });
});
