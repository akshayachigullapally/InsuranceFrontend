import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { PricingRulesEffects } from './pricing-rules.effects';
import * as PricingRulesActions from './pricing-rules.actions';
import { PricingRuleService } from '../../services/pricing-rule.service';
import { PricingRuleResponse } from '../../dtos/financial/pricing-rule-response.dto';

function collect(effect$: Observable<unknown>): unknown[] {
  const results: unknown[] = [];
  effect$.subscribe((action) => results.push(action));
  return results;
}

describe('PricingRulesEffects', () => {
  let actions$: Observable<Action>;
  let effects: PricingRulesEffects;
  let service: Record<string, ReturnType<typeof vi.fn>>;
  const pricingRule = { id: 1, productId: 1, status: 'ACTIVE' } as PricingRuleResponse;

  beforeEach(() => {
    service = {
      getAllRules: vi.fn(),
      createRule: vi.fn(),
      updateStatus: vi.fn(),
      archiveRule: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        PricingRulesEffects,
        provideMockActions(() => actions$),
        { provide: PricingRuleService, useValue: service },
      ],
    });
    effects = TestBed.inject(PricingRulesEffects);
  });

  it('loads pricing rules', () => {
    service['getAllRules'].mockReturnValue(of([pricingRule]));
    actions$ = of(PricingRulesActions.loadPricingRules());

    expect(collect(effects.loadPricingRules$)).toEqual([
      PricingRulesActions.loadPricingRulesSuccess({ pricingRules: [pricingRule] }),
    ]);
  });

  it('maps create errors', () => {
    service['createRule'].mockReturnValue(throwError(() => ({ error: { messages: ['Rate too high'] } })));
    actions$ = of(PricingRulesActions.createPricingRule({ request: {} as never }));

    expect(collect(effects.createPricingRule$)).toEqual([
      PricingRulesActions.createPricingRuleFailure({ error: 'Rate too high' }),
    ]);
  });

  it('updates a rule status', () => {
    service['updateStatus'].mockReturnValue(of(pricingRule));
    actions$ = of(PricingRulesActions.updatePricingRuleStatus({ ruleId: 1, status: 'ACTIVE' as never }));

    expect(collect(effects.updatePricingRuleStatus$)).toEqual([
      PricingRulesActions.updatePricingRuleStatusSuccess({ pricingRule }),
    ]);
  });

  it('archives a rule', () => {
    service['archiveRule'].mockReturnValue(of({ message: 'ok' }));
    actions$ = of(PricingRulesActions.archivePricingRule({ ruleId: 1 }));

    expect(collect(effects.archivePricingRule$)).toEqual([PricingRulesActions.archivePricingRuleSuccess({ ruleId: 1 })]);
  });
});
