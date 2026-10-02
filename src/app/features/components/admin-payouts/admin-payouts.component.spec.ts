import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { AdminPayoutsComponent } from './admin-payouts.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import {
  clearPayoutsError,
  loadPayouts,
  retryPayout,
} from '../../state/payouts/payouts.actions';
import { PayoutResponse } from '../../dtos/financial/payout-response.dto';
import { selectPayouts } from '../../state/payouts/payouts.selectors';

type PayoutsInternals = {
  retry(payout: PayoutResponse): void;
};

describe('AdminPayoutsComponent', () => {
  let fixture: ComponentFixture<AdminPayoutsComponent>;
  let page: PayoutsInternals;
  let store: MockStore;
  const payout = { id: 6, payoutReference: 'PAY-6' } as PayoutResponse;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPayoutsComponent],
      providers: pageTestProviders(),
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(AdminPayoutsComponent);
    page = fixture.componentInstance as unknown as PayoutsInternals;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads all payouts on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(clearPayoutsError());
    expect(store.dispatch).toHaveBeenCalledWith(loadPayouts());
  });

  it('retries a failed payout', () => {
    page.retry(payout);

    expect(store.dispatch).toHaveBeenCalledWith(
      retryPayout({ payoutId: 6, request: { externalReference: '' } }),
    );
  });

  it('has no manual process, success or fail buttons', () => {
    store.overrideSelector(selectPayouts, [
      { id: 1, payoutReference: 'PO-1', status: 'PENDING', amount: 100, retryCount: 0 },
      { id: 2, payoutReference: 'PO-2', status: 'SUCCESS', amount: 100, retryCount: 0, externalReference: 'AUTO-1' },
    ] as PayoutResponse[]);
    store.refreshState();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('Process');
    expect(text).not.toContain('Mark success');
    expect(text).not.toContain('Mark failed');
    expect(text).toContain('Paying automatically');
    expect(text).toContain('Transfer AUTO-1');
  });

  it('clears errors on destroy', () => {
    vi.mocked(store.dispatch).mockClear();

    fixture.destroy();

    expect(store.dispatch).toHaveBeenCalledWith(clearPayoutsError());
  });
});
