import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { PaymentsEffects } from './payments.effects';
import * as PaymentsActions from './payments.actions';
import { PaymentService } from '../../services/payment.service';
import { PaymentResponse } from '../../dtos/financial/payment-response.dto';

function collect(effect$: Observable<unknown>): unknown[] {
  const results: unknown[] = [];
  effect$.subscribe((action) => results.push(action));
  return results;
}

describe('PaymentsEffects', () => {
  let actions$: Observable<Action>;
  let effects: PaymentsEffects;
  let paymentService: Record<string, ReturnType<typeof vi.fn>>;
  const payment = { id: 1, paymentReference: 'PAYM-1', status: 'PENDING' } as PaymentResponse;

  beforeEach(() => {
    paymentService = {
      getAllPayments: vi.fn(),
      getMyPayments: vi.fn(),
      refundPayment: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        PaymentsEffects,
        provideMockActions(() => actions$),
        { provide: PaymentService, useValue: paymentService },
      ],
    });
    effects = TestBed.inject(PaymentsEffects);
  });

  it('loads all payments for admins', () => {
    paymentService['getAllPayments'].mockReturnValue(of([payment]));
    actions$ = of(PaymentsActions.loadPayments());

    expect(collect(effects.loadPayments$)).toEqual([PaymentsActions.loadPaymentsSuccess({ payments: [payment] })]);
  });
});
