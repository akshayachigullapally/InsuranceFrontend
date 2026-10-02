import { DialogService } from '../../../shared/services/dialog.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { AdminPayoutsComponent } from './admin-payouts.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import {
  clearPayoutsError,
  loadPayouts,
  markPayoutFail,
  markPayoutSuccess,
  processPayout,
  retryPayout,
} from '../../state/payouts/payouts.actions';
import { PayoutResponse } from '../../dtos/financial/payout-response.dto';

type PayoutsInternals = {
  process(payout: PayoutResponse): void;
  markSuccess(payout: PayoutResponse): void;
  markFail(payout: PayoutResponse): void;
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

  it('processes and retries payouts', () => {
    page.process(payout);
    page.retry(payout);

    expect(store.dispatch).toHaveBeenCalledWith(
      processPayout({ payoutId: 6, request: { externalReference: '' } }),
    );
    expect(store.dispatch).toHaveBeenCalledWith(
      retryPayout({ payoutId: 6, request: { externalReference: '' } }),
    );
  });

  it('marks a payout successful with a mock reference', () => {
    page.markSuccess(payout);

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: markPayoutSuccess.type,
        payoutId: 6,
        request: { externalReference: expect.stringMatching(/^MOCK-PAYOUT-\d+$/) },
      }),
    );
  });

  it('uses a default reason when the reason is left blank', async () => {
    vi.spyOn(TestBed.inject(DialogService), 'prompt').mockResolvedValue('   ');

    await page.markFail(payout);

    expect(store.dispatch).toHaveBeenCalledWith(
      markPayoutFail({ payoutId: 6, request: { externalReference: '', failureReason: 'Payout failed' } }),
    );
  });

  it('clears errors on destroy', () => {
    vi.mocked(store.dispatch).mockClear();

    fixture.destroy();

    expect(store.dispatch).toHaveBeenCalledWith(clearPayoutsError());
  });
});
