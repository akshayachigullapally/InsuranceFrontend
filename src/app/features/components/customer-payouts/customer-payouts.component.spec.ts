import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { CustomerPayoutsComponent } from './customer-payouts.component';
import { PayoutResponse } from '../../dtos/financial/payout-response.dto';
import { clearPayoutsError, loadMyPayouts } from '../../state/payouts/payouts.actions';
import {
  selectPayouts,
  selectPayoutsError,
  selectPayoutsLoading,
} from '../../state/payouts/payouts.selectors';

function makePayout(overrides: Partial<PayoutResponse> = {}): PayoutResponse {
  return {
    id: 1,
    payoutReference: 'PAY-0001',
    customerId: 7,
    claimId: 2,
    claimNumber: 'CLM-0002',
    policyId: 3,
    triggerEventId: null,
    amount: 15000,
    status: 'PENDING' as PayoutResponse['status'],
    externalReference: null,
    failureReason: null,
    retryCount: 0,
    createdAt: '2026-09-22T09:00:00',
    processedAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe('CustomerPayoutsComponent', () => {
  let fixture: ComponentFixture<CustomerPayoutsComponent>;
  let store: MockStore;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerPayoutsComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectPayouts, value: [] },
            { selector: selectPayoutsLoading, value: false },
            { selector: selectPayoutsError, value: null },
          ],
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(CustomerPayoutsComponent);
    element = fixture.nativeElement;
  });

  function setPayouts(payouts: PayoutResponse[]): void {
    store.overrideSelector(selectPayouts, payouts);
    store.refreshState();
    fixture.detectChanges();
  }

  it('clears errors and loads my payouts on init', () => {
    fixture.detectChanges();

    expect(store.dispatch).toHaveBeenCalledWith(clearPayoutsError());
    expect(store.dispatch).toHaveBeenCalledWith(loadMyPayouts());
  });

  it('clears errors again on destroy', () => {
    fixture.detectChanges();
    vi.mocked(store.dispatch).mockClear();

    fixture.destroy();

    expect(store.dispatch).toHaveBeenCalledWith(clearPayoutsError());
  });

  it('shows the empty state when there are no payouts', () => {
    fixture.detectChanges();

    expect(element.textContent).toContain('No payouts yet');
  });

  it('renders a card per payout with the amount', () => {
    setPayouts([makePayout(), makePayout({ id: 2, payoutReference: 'PAY-0002', amount: 2500.5 })]);

    expect(element.textContent).toContain('PAY-0001');
    expect(element.textContent).toContain('PAY-0002');
    expect(element.textContent).toContain('15,000.00');
    expect(element.textContent).toContain('2,500.50');
  });

  it('shows retry count and failure reason when present', () => {
    setPayouts([makePayout({ retryCount: 2, failureReason: 'Bank account invalid' })]);

    expect(element.textContent).toContain('Retried 2');
    expect(element.textContent).toContain('times');
    expect(element.textContent).toContain('Bank account invalid');
  });

  it('shows a spinner while loading', () => {
    store.overrideSelector(selectPayoutsLoading, true);
    setPayouts([makePayout()]);

    expect(element.textContent).toContain('Loading your payouts...');
    expect(element.textContent).not.toContain('PAY-0001');
  });

  it('shows the error message from the store', () => {
    store.overrideSelector(selectPayoutsError, 'Could not load payouts');
    store.refreshState();
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Could not load payouts');
  });
});
