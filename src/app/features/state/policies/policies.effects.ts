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
import { PolicyService } from '../../services/policy.service';
import { httpErrorMessage } from '../products/products.effects';
import {
  approvePolicy,
  approvePolicyFailure,
  approvePolicySuccess,
  cancelPolicy,
  cancelPolicyFailure,
  cancelPolicySuccess,
  createCustomPolicy,
  createPolicy,
  createPolicyFailure,
  createPolicySuccess,
  loadAdminPolicies,
  loadAdminPoliciesFailure,
  loadAdminPoliciesSuccess,
  loadAdminPolicy,
  loadAdminPolicyFailure,
  loadAdminPolicySuccess,
  loadMyPolicies,
  loadMyPoliciesFailure,
  loadMyPoliciesSuccess,
  loadMyPolicy,
  loadMyPolicyFailure,
  loadMyPolicySuccess,
  loadReviewPolicies,
  loadReviewPoliciesFailure,
  loadReviewPoliciesSuccess,
  rejectPolicy,
  rejectPolicyFailure,
  rejectPolicySuccess,
} from './policies.actions';

@Injectable()
export class PoliciesEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly policyService: PolicyService,
    private readonly router: Router,
  ) {}

  loadMyPolicies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadMyPolicies),
      switchMap(({ status }) =>
        this.policyService.getMyPolicies(status).pipe(
          map(policies => loadMyPoliciesSuccess({ policies })),
          catchError(error =>
            of(loadMyPoliciesFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  loadMyPolicy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadMyPolicy),
      switchMap(({ policyId }) =>
        this.policyService.getMyPolicy(policyId).pipe(
          map(policy => loadMyPolicySuccess({ policy })),
          catchError(error =>
            of(loadMyPolicyFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  createPolicy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createPolicy),
      exhaustMap(({ request }) =>
        this.policyService.createPolicy(request).pipe(
          map(policy => createPolicySuccess({ policy })),
          catchError(error =>
            of(createPolicyFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  createCustomPolicy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createCustomPolicy),
      exhaustMap(({ request }) =>
        this.policyService.createCustomPolicy(request).pipe(
          map(policy => createPolicySuccess({ policy })),
          catchError(error =>
            of(createPolicyFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  cancelPolicy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(cancelPolicy),
      exhaustMap(({ policyId }) =>
        this.policyService.cancelPolicy(policyId).pipe(
          switchMap(() => this.policyService.getMyPolicy(policyId)),
          map(policy => cancelPolicySuccess({ policy })),
          catchError(error =>
            of(cancelPolicyFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  loadReviewPolicies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadReviewPolicies),
      switchMap(() =>
        this.policyService.getPendingPolicies().pipe(
          map(policies => loadReviewPoliciesSuccess({ policies })),
          catchError(error =>
            of(loadReviewPoliciesFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  loadAdminPolicies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAdminPolicies),
      switchMap(({ status }) =>
        this.policyService.getAllPolicies(status).pipe(
          map(policies => loadAdminPoliciesSuccess({ policies })),
          catchError(error =>
            of(loadAdminPoliciesFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  loadAdminPolicy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAdminPolicy),
      switchMap(({ policyId }) =>
        this.policyService.getPolicy(policyId).pipe(
          map(policy => loadAdminPolicySuccess({ policy })),
          catchError(error =>
            of(loadAdminPolicyFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  approvePolicy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(approvePolicy),
      exhaustMap(({ policyId }) =>
        this.policyService.approvePolicy(policyId).pipe(
          map(policy => approvePolicySuccess({ policy })),
          catchError(error =>
            of(approvePolicyFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  rejectPolicy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(rejectPolicy),
      exhaustMap(({ policyId, reason }) =>
        this.policyService.rejectPolicy(policyId, reason.trim()).pipe(
          map(policy => rejectPolicySuccess({ policy })),
          catchError(error =>
            of(rejectPolicyFailure({
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
        ofType(createPolicySuccess),
        tap(() => void this.router.navigate(['/customer/policies'])),
      ),
    { dispatch: false },
  );

  redirectAfterReview$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(approvePolicySuccess, rejectPolicySuccess),
        tap(() => void this.router.navigate(['/underwriter/policies'])),
      ),
    { dispatch: false },
  );
}