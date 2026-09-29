import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { ClaimsEffects } from './claims.effects';
import * as ClaimsActions from './claims.actions';
import { ClaimService } from '../../services/claim.service';
import { ClaimResponse } from '../../dtos/claims/claim-response.dto';

function collect(effect$: Observable<unknown>): unknown[] {
  const results: unknown[] = [];
  effect$.subscribe((action) => results.push(action));
  return results;
}

describe('ClaimsEffects', () => {
  let actions$: Observable<Action>;
  let effects: ClaimsEffects;
  let claimService: Record<string, ReturnType<typeof vi.fn>>;
  let router: { navigate: ReturnType<typeof vi.fn> };
  const claim = { id: 1, status: 'SUBMITTED' } as ClaimResponse;

  beforeEach(() => {
    claimService = {
      getMyClaims: vi.fn(),
      getMyClaim: vi.fn(),
      createClaim: vi.fn(),
      cancelClaim: vi.fn(),
      approveClaim: vi.fn(),
      rejectClaim: vi.fn(),
      settleClaim: vi.fn(),
      getAllClaims: vi.fn(),
    };
    router = { navigate: vi.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      providers: [
        ClaimsEffects,
        provideMockActions(() => actions$),
        { provide: ClaimService, useValue: claimService },
        { provide: Router, useValue: router },
      ],
    });
    effects = TestBed.inject(ClaimsEffects);
  });

  it('loads my claims with the status filter', () => {
    claimService['getMyClaims'].mockReturnValue(of([claim]));
    actions$ = of(ClaimsActions.loadMyClaims({ status: 'SUBMITTED' }));

    expect(collect(effects.loadMyClaims$)).toEqual([ClaimsActions.loadMyClaimsSuccess({ claims: [claim] })]);
    expect(claimService['getMyClaims']).toHaveBeenCalledWith('SUBMITTED');
  });

  it('maps an HTTP error to loadMyClaimsFailure', () => {
    claimService['getMyClaims'].mockReturnValue(throwError(() => ({ error: { message: 'Forbidden' } })));
    actions$ = of(ClaimsActions.loadMyClaims({}));

    expect(collect(effects.loadMyClaims$)).toEqual([ClaimsActions.loadMyClaimsFailure({ error: 'Forbidden' })]);
  });

  it('reloads the claim after cancelling it', () => {
    const cancelled = { ...claim, status: 'CANCELLED' } as ClaimResponse;
    claimService['cancelClaim'].mockReturnValue(of({ message: 'Cancelled' }));
    claimService['getMyClaim'].mockReturnValue(of(cancelled));
    actions$ = of(ClaimsActions.cancelClaim({ claimId: 1 }));

    expect(collect(effects.cancelClaim$)).toEqual([ClaimsActions.cancelClaimSuccess({ claim: cancelled })]);
    expect(claimService['getMyClaim']).toHaveBeenCalledWith(1);
  });

  it('passes the approved amount to the service', () => {
    claimService['approveClaim'].mockReturnValue(of(claim));
    actions$ = of(ClaimsActions.approveClaim({ claimId: 1, approvedAmount: 900 }));

    expect(collect(effects.approveClaim$)).toEqual([ClaimsActions.approveClaimSuccess({ claim })]);
    expect(claimService['approveClaim']).toHaveBeenCalledWith(1, 900);
  });

  it('settles a claim with the officer notes', () => {
    const settled = { ...claim, status: 'SETTLED' } as ClaimResponse;
    claimService['settleClaim'].mockReturnValue(of(settled));
    actions$ = of(ClaimsActions.settleClaim({ claimId: 1, notes: 'Paid by bank transfer' }));

    expect(collect(effects.settleClaim$)).toEqual([ClaimsActions.settleClaimSuccess({ claim: settled })]);
    expect(claimService['settleClaim']).toHaveBeenCalledWith(1, 'Paid by bank transfer');
  });

  it('falls back to a generic message for unknown errors', () => {
    claimService['rejectClaim'].mockReturnValue(throwError(() => ({})));
    actions$ = of(ClaimsActions.rejectClaim({ claimId: 1, reason: 'No' }));

    expect(collect(effects.rejectClaim$)).toEqual([
      ClaimsActions.rejectClaimFailure({ error: 'An unexpected error occurred.' }),
    ]);
  });

  it('navigates to my claims after creating a claim', () => {
    actions$ = of(ClaimsActions.createClaimSuccess({ claim }));

    collect(effects.redirectAfterCreate$);

    expect(router.navigate).toHaveBeenCalledWith(['/customer/claims']);
  });

  it('navigates back to the officer queue after a decision', () => {
    actions$ = of(ClaimsActions.rejectClaimSuccess({ claim }));

    collect(effects.redirectAfterDecision$);

    expect(router.navigate).toHaveBeenCalledWith(['/claims-officer/claims']);
  });
});
