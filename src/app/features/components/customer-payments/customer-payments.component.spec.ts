import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { CustomerPaymentsComponent } from './customer-payments.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import { clearPaymentsError, createPayment, loadMyPayments } from '../../state/payments/payments.actions';
import { loadMyPolicies } from '../../state/policies/policies.actions';
import { clearPayoutsError, loadMyPayouts } from '../../state/payouts/payouts.actions';
import { PolicyResponse } from '../../dtos/policies/policy-response.dto';
import { PaymentResponse } from '../../dtos/financial/payment-response.dto';
import { mockRootState } from '../../../../testing/test-helpers';
import { initialPaymentsState } from '../../state/payments/payments.state';
import { initialPoliciesState } from '../../state/policies/policies.state';
import { firstValueFrom } from 'rxjs';

type PaymentsInternals = {
  openCheckout(policyId?: number | null): void;
  closeCheckout(): void;
  pay(request: { policyId: number; method: 'MOCK_CARD' | 'MOCK_UPI' | 'MOCK_BANK_TRANSFER' }): void;
  checkoutOpen: boolean;
  checkoutPolicyId: number | null;
  paidPayment: PaymentResponse | null;
  checkoutError: string | null;
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

  it('opens checkout for the chosen policy', () => {
    page.openCheckout(3);

    expect(page.checkoutOpen).toBe(true);
    expect(page.checkoutPolicyId).toBe(3);
    expect(page.paidPayment).toBeNull();
  });

  it('pays through the store and shows the receipt once the payment is saved', () => {
    const paid = { id: 9, policyId: 3, status: 'SUCCESS' } as PaymentResponse;
    page.openCheckout(3);

    page.pay({ policyId: 3, method: 'MOCK_UPI' });
    expect(store.dispatch).toHaveBeenCalledWith(
      createPayment({ request: { policyId: 3, method: 'MOCK_UPI' } }),
    );

    store.setState(mockRootState({ payments: { ...initialPaymentsState, isSaving: true } }));
    expect(page.paidPayment).toBeNull();

    store.setState(
      mockRootState({ payments: { ...initialPaymentsState, isSaving: false, selectedPayment: paid } }),
    );
    expect(page.paidPayment).toEqual(paid);
    expect(page.checkoutError).toBeNull();
  });

  it('keeps checkout open with the server error when paying fails', () => {
    page.openCheckout(3);
    page.pay({ policyId: 3, method: 'MOCK_CARD' });

    store.setState(mockRootState({ payments: { ...initialPaymentsState, isSaving: true } }));
    store.setState(
      mockRootState({ payments: { ...initialPaymentsState, error: 'Policy already paid successfully' } }),
    );

    expect(page.checkoutOpen).toBe(true);
    expect(page.checkoutError).toBe('Policy already paid successfully');
    expect(page.paidPayment).toBeNull();
  });

  it('closes checkout and resets it', () => {
    page.openCheckout(3);
    page.closeCheckout();

    expect(page.checkoutOpen).toBe(false);
    expect(store.dispatch).toHaveBeenCalledWith(clearPaymentsError());
  });

  it('offers only active policies that are not paid yet', async () => {
    store.setState(
      mockRootState({
        policies: {
          ...initialPoliciesState,
          myPolicies: [
            { id: 1, status: 'ACTIVE' },
            { id: 2, status: 'PENDING' },
            { id: 3, status: 'ACTIVE' },
          ] as PolicyResponse[],
        },
        payments: {
          ...initialPaymentsState,
          payments: [{ id: 5, policyId: 3, status: 'SUCCESS' }] as PaymentResponse[],
        },
      }),
    );

    const payable = await firstValueFrom(component.payablePolicies$);

    expect(payable.map((policy) => policy.id)).toEqual([1]);
  });

  it('clears errors on destroy', () => {
    vi.mocked(store.dispatch).mockClear();

    fixture.destroy();

    expect(store.dispatch).toHaveBeenCalledWith(clearPaymentsError());
  });
});
