import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { CustomerPaymentsComponent } from './customer-payments.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import { clearPaymentsError, createPayment, loadMyPayments } from '../../state/payments/payments.actions';
import { loadMyPolicies } from '../../state/policies/policies.actions';
import { clearPayoutsError, loadMyPayouts } from '../../state/payouts/payouts.actions';
import { PolicyResponse } from '../../dtos/policies/policy-response.dto';

type PaymentsInternals = {
  openCreate(): void;
  closeForm(): void;
  submit(): void;
  activePolicies(policies: PolicyResponse[]): PolicyResponse[];
  formOpen: boolean;
};

describe('CustomerPaymentsComponent', () => {
  let fixture: ComponentFixture<CustomerPaymentsComponent>;
  let component: CustomerPaymentsComponent;
  let page: PaymentsInternals;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerPaymentsComponent],
      providers: pageTestProviders(),
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(CustomerPaymentsComponent);
    component = fixture.componentInstance;
    page = component as unknown as PaymentsInternals;
    fixture.detectChanges();
  });

  it('loads my payments, payouts and policies on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(clearPaymentsError());
    expect(store.dispatch).toHaveBeenCalledWith(clearPayoutsError());
    expect(store.dispatch).toHaveBeenCalledWith(loadMyPayments());
    expect(store.dispatch).toHaveBeenCalledWith(loadMyPayouts());
    expect(store.dispatch).toHaveBeenCalledWith(loadMyPolicies({}));
  });

  it('starts on the payments tab and switches to payouts', () => {
    const tabs = component as unknown as { activeTab: string; switchTab(tab: string): void };
    expect(tabs.activeTab).toBe('payments');

    tabs.switchTab('payouts');

    expect(tabs.activeTab).toBe('payouts');
  });

  it('opens the form with default values', () => {
    component.form.patchValue({ policyId: 3 });

    page.openCreate();

    expect(page.formOpen).toBe(true);
    expect(component.form.getRawValue()).toEqual({ policyId: null, method: 'MOCK_CARD' });
  });

  it('does not submit without a policy', () => {
    page.openCreate();
    vi.mocked(store.dispatch).mockClear();

    page.submit();

    expect(store.dispatch).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
    expect(page.formOpen).toBe(true);
  });

  it('dispatches createPayment and closes the form when valid', () => {
    page.openCreate();
    component.form.setValue({ policyId: 3, method: 'MOCK_UPI' });

    page.submit();

    expect(store.dispatch).toHaveBeenCalledWith(
      createPayment({ request: { policyId: 3, method: 'MOCK_UPI' } }),
    );
    expect(page.formOpen).toBe(false);
  });

  it('offers only active policies for payment', () => {
    const policies = [
      { id: 1, status: 'ACTIVE' },
      { id: 2, status: 'PENDING' },
    ] as PolicyResponse[];

    expect(page.activePolicies(policies).map((policy) => policy.id)).toEqual([1]);
  });

  it('clears errors on destroy', () => {
    vi.mocked(store.dispatch).mockClear();

    fixture.destroy();

    expect(store.dispatch).toHaveBeenCalledWith(clearPaymentsError());
  });
});
