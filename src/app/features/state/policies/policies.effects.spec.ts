import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { PoliciesEffects } from './policies.effects';
import * as PoliciesActions from './policies.actions';
import { PolicyService } from '../../services/policy.service';
import { PolicyResponse } from '../../dtos/policies/policy-response.dto';

function collect(effect$: Observable<unknown>): unknown[] {
  const results: unknown[] = [];
  effect$.subscribe((action) => results.push(action));
  return results;
}

describe('PoliciesEffects', () => {
  let actions$: Observable<Action>;
  let effects: PoliciesEffects;
  let policyService: Record<string, ReturnType<typeof vi.fn>>;
  let router: { navigate: ReturnType<typeof vi.fn> };
  const policy = { id: 1, status: 'PENDING' } as PolicyResponse;

  beforeEach(() => {
    policyService = {
      getMyPolicies: vi.fn(),
      getMyPolicy: vi.fn(),
      createPolicy: vi.fn(),
      createCustomPolicy: vi.fn(),
      cancelPolicy: vi.fn(),
      approvePolicy: vi.fn(),
      rejectPolicy: vi.fn(),
    };
    router = { navigate: vi.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      providers: [
        PoliciesEffects,
        provideMockActions(() => actions$),
        { provide: PolicyService, useValue: policyService },
        { provide: Router, useValue: router },
      ],
    });
    effects = TestBed.inject(PoliciesEffects);
  });

  it('loads my policies', () => {
    policyService['getMyPolicies'].mockReturnValue(of([policy]));
    actions$ = of(PoliciesActions.loadMyPolicies({}));

    expect(collect(effects.loadMyPolicies$)).toEqual([
      PoliciesActions.loadMyPoliciesSuccess({ policies: [policy] }),
    ]);
  });

  it('reloads the policy after cancelling it', () => {
    const cancelled = { ...policy, status: 'CANCELLED' } as PolicyResponse;
    policyService['cancelPolicy'].mockReturnValue(of({ message: 'ok' }));
    policyService['getMyPolicy'].mockReturnValue(of(cancelled));
    actions$ = of(PoliciesActions.cancelPolicy({ policyId: 1 }));

    expect(collect(effects.cancelPolicy$)).toEqual([PoliciesActions.cancelPolicySuccess({ policy: cancelled })]);
  });
});
