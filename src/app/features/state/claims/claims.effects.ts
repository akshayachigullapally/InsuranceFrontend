import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  catchError,
  exhaustMap,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { ClaimService } from '../../services/claim.service';
import { httpErrorMessage } from '../products/products.effects';
import {
  approveClaim,
  approveClaimFailure,
  approveClaimSuccess,
  cancelClaim,
  cancelClaimFailure,
  cancelClaimSuccess,
  createClaim,
  createClaimFailure,
  createClaimSuccess,
  loadAdminClaim,
  loadAdminClaimFailure,
  loadAdminClaimSuccess,
  loadAdminClaims,
  loadAdminClaimsFailure,
  loadAdminClaimsSuccess,
  loadMyClaim,
  loadMyClaimFailure,
  loadMyClaimSuccess,
  loadMyClaims,
  loadMyClaimsFailure,
  loadMyClaimsSuccess,
  loadReviewClaim,
  loadReviewClaimFailure,
  loadReviewClaimSuccess,
  loadSubmittedClaims,
  loadSubmittedClaimsFailure,
  loadSubmittedClaimsSuccess,
  rejectClaim,
  rejectClaimFailure,
  rejectClaimSuccess,
  startClaimReview,
  startClaimReviewFailure,
  startClaimReviewSuccess,
} from './claims.actions';

@Injectable()
export class ClaimsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly claimService: ClaimService,
    private readonly router: Router,
  ) {}

  loadMyClaims$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadMyClaims),
      switchMap(({ status }) =>
        this.claimService.getMyClaims(status).pipe(
          map(claims => loadMyClaimsSuccess({ claims })),
          catchError(error =>
            of(loadMyClaimsFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  loadMyClaim$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadMyClaim),
      switchMap(({ claimId }) =>
        this.claimService.getMyClaim(claimId).pipe(
          map(claim => loadMyClaimSuccess({ claim })),
          catchError(error =>
            of(loadMyClaimFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  createClaim$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createClaim),
      exhaustMap(({ request }) =>
        this.claimService.createClaim(request).pipe(
          map(claim => createClaimSuccess({ claim })),
          catchError(error =>
            of(createClaimFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  cancelClaim$ = createEffect(() =>
    this.actions$.pipe(
      ofType(cancelClaim),
      exhaustMap(({ claimId }) =>
        this.claimService.cancelClaim(claimId).pipe(
          switchMap(() =>
            this.claimService.getMyClaim(claimId),
          ),
          map(claim => cancelClaimSuccess({ claim })),
          catchError(error =>
            of(cancelClaimFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  loadSubmittedClaims$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadSubmittedClaims),
      switchMap(() =>
        this.claimService.getSubmittedClaims().pipe(
          map(claims =>
            loadSubmittedClaimsSuccess({ claims }),
          ),
          catchError(error =>
            of(loadSubmittedClaimsFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  loadReviewClaim$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadReviewClaim),
      switchMap(({ claimId }) =>
        this.claimService.getReviewClaim(claimId).pipe(
          map(claim =>
            loadReviewClaimSuccess({ claim }),
          ),
          catchError(error =>
            of(loadReviewClaimFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  startClaimReview$ = createEffect(() =>
    this.actions$.pipe(
      ofType(startClaimReview),
      exhaustMap(({ claimId }) =>
        this.claimService.startReview(claimId).pipe(
          map(claim =>
            startClaimReviewSuccess({ claim }),
          ),
          catchError(error =>
            of(startClaimReviewFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  approveClaim$ = createEffect(() =>
    this.actions$.pipe(
      ofType(approveClaim),
      exhaustMap(({ claimId, approvedAmount }) =>
        this.claimService
          .approveClaim(claimId, approvedAmount)
          .pipe(
            map(claim =>
              approveClaimSuccess({ claim }),
            ),
            catchError(error =>
              of(approveClaimFailure({
                error: httpErrorMessage(error),
              })),
            ),
          ),
      ),
    ),
  );

  rejectClaim$ = createEffect(() =>
    this.actions$.pipe(
      ofType(rejectClaim),
      exhaustMap(({ claimId, reason }) =>
        this.claimService.rejectClaim(claimId, reason).pipe(
          map(claim =>
            rejectClaimSuccess({ claim }),
          ),
          catchError(error =>
            of(rejectClaimFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  loadAdminClaims$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAdminClaims),
      switchMap(({ status }) =>
        this.claimService.getAllClaims(status).pipe(
          map(claims =>
            loadAdminClaimsSuccess({ claims }),
          ),
          catchError(error =>
            of(loadAdminClaimsFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  loadAdminClaim$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAdminClaim),
      switchMap(({ claimId }) =>
        this.claimService.getAdminClaim(claimId).pipe(
          map(claim =>
            loadAdminClaimSuccess({ claim }),
          ),
          catchError(error =>
            of(loadAdminClaimFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  redirectAfterCreate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(createClaimSuccess),
        tap(() =>
          void this.router.navigate(['/customer/claims']),
        ),
      ),
    { dispatch: false },
  );

  redirectAfterDecision$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(approveClaimSuccess, rejectClaimSuccess),
        tap(() =>
          void this.router.navigate(['/claims-officer/claims']),
        ),
      ),
    { dispatch: false },
  );
}