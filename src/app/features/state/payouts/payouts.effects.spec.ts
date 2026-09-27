import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { PayoutsEffects } from './payouts.effects';
import * as PayoutsActions from './payouts.actions';
import { PayoutService } from '../../services/payout.service';
import { PayoutResponse } from '../../dtos/financial/payout-response.dto';

function collect(effect$: Observable<unknown>): unknown[] {
  const results: unknown[] = [];
  effect$.subscribe((action) => results.push(action));
  return results;
}

describe('PayoutsEffects', () => {
  let actions$: Observable<Action>;
  let effects: PayoutsEffects;
  let payoutService: Record<string, ReturnType<typeof vi.fn>>;
  const payout = { id: 1, payoutReference: 'PAY-1', status: 'PENDING' } as PayoutResponse;
  const request = { externalReference: '' } as never;

  beforeEach(() => {
    payoutService = {
      getAllPayouts: vi.fn(),
      getMyPayouts: vi.fn(),
      processPayout: vi.fn(),
      retryPayout: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        PayoutsEffects,
        provideMockActions(() => actions$),
        { provide: PayoutService, useValue: payoutService },
      ],
    });
    effects = TestBed.inject(PayoutsEffects);
  });

  it('loads all payouts and my payouts', () => {
    payoutService['getAllPayouts'].mockReturnValue(of([payout]));
    actions$ = of(PayoutsActions.loadPayouts());
    expect(collect(effects.loadPayouts$)).toEqual([PayoutsActions.loadPayoutsSuccess({ payouts: [payout] })]);

    payoutService['getMyPayouts'].mockReturnValue(of([payout]));
    actions$ = of(PayoutsActions.loadMyPayouts());
    expect(collect(effects.loadMyPayouts$)).toEqual([PayoutsActions.loadMyPayoutsSuccess({ payouts: [payout] })]);
  });

  it('processes a payout', () => {
    payoutService['processPayout'].mockReturnValue(of(payout));
    actions$ = of(PayoutsActions.processPayout({ payoutId: 1, request }));

    expect(collect(effects.processPayout$)).toEqual([PayoutsActions.processPayoutSuccess({ payout })]);
    expect(payoutService['processPayout']).toHaveBeenCalledWith(1, request);
  });

  it('maps retry errors', () => {
    payoutService['retryPayout'].mockReturnValue(throwError(() => ({ error: { message: 'Retry limit reached' } })));
    actions$ = of(PayoutsActions.retryPayout({ payoutId: 1, request }));

    expect(collect(effects.retryPayout$)).toEqual([
      PayoutsActions.retryPayoutFailure({ error: 'Retry limit reached' }),
    ]);
  });
});
