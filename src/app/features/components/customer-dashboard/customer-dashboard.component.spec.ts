import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { firstValueFrom } from 'rxjs';
import { CustomerDashboardComponent } from './customer-dashboard.component';
import { loggedInAuth, mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { loadMyPolicies } from '../../state/policies/policies.actions';
import { loadMyClaims } from '../../state/claims/claims.actions';

describe('CustomerDashboardComponent', () => {
  let fixture: ComponentFixture<CustomerDashboardComponent>;
  let component: CustomerDashboardComponent;
  let store: MockStore;

  beforeEach(async () => {
    const root = mockRootState();
    await TestBed.configureTestingModule({
      imports: [CustomerDashboardComponent],
      providers: pageTestProviders({
        auth: loggedInAuth('ROLE_CUSTOMER'),
        policies: {
          ...root.policies,
          myPolicies: [
            { id: 1, policyNumber: 'POL-1', status: 'ACTIVE', sumInsured: 100000 },
            { id: 2, policyNumber: 'POL-2', status: 'PENDING', sumInsured: 50000 },
          ],
        },
        claims: { ...root.claims, myClaims: [{ id: 1, claimNumber: 'CLM-1', status: 'SUBMITTED' }] },
      }),
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(CustomerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads my policies and claims on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(loadMyPolicies({}));
    expect(store.dispatch).toHaveBeenCalledWith(loadMyClaims({}));
  });

  it('exposes active policy count, sum insured and claim count', async () => {
    expect(await firstValueFrom(component.activePolicyCount$)).toBe(1);
    expect(await firstValueFrom(component.sumInsured$)).toBe(100000);
    expect(await firstValueFrom(component.claimCount$)).toBe(1);
  });

  it('greets the signed-in user', () => {
    expect(fixture.nativeElement.textContent).toContain('Asha');
  });

  it('renders the quick action links', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('a[href="/customer/policies/new"]')).not.toBeNull();
    expect(element.querySelector('a[href="/customer/claims/new"]')).not.toBeNull();
  });

  it('shows whether each active policy is paid, with a pay link when it is not', () => {
    const element: HTMLElement = fixture.nativeElement;
    const root = mockRootState();
    const policies = {
      ...root.policies,
      myPolicies: [
        { id: 1, policyNumber: 'POL-1', status: 'ACTIVE', sumInsured: 100000 },
        { id: 3, policyNumber: 'POL-3', status: 'ACTIVE', sumInsured: 20000 },
      ],
    };
    store.setState(
      mockRootState({
        auth: loggedInAuth('ROLE_CUSTOMER'),
        policies,
        payments: {
          ...root.payments,
          loaded: true,
          payments: [
            { id: 5, policyId: 1, policyNumber: 'POL-1', status: 'SUCCESS' },
            // An old payment for a previous policy that had id 3: must not count as paid.
            { id: 6, policyId: 3, policyNumber: 'POL-OLD', status: 'SUCCESS' },
          ],
        },
      }),
    );
    fixture.detectChanges();

    expect(element.textContent).toContain('Premium paid');
    expect(element.querySelector('a[href="/customer/payments?pay=3"]')?.textContent).toContain(
      'Pay now',
    );
    expect(element.querySelector('a[href="/customer/payments?pay=1"]')).toBeNull();
  });
});
