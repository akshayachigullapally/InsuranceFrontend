import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap } from 'rxjs/operators';
import { PricingRuleService } from '../../services/pricing-rule.service';
import { httpErrorMessage } from '../products/products.effects';
import {
  archivePricingRule,
  archivePricingRuleFailure,
  archivePricingRuleSuccess,
  createPricingRule,
  createPricingRuleFailure,
  createPricingRuleSuccess,
  loadPricingRule,
  loadPricingRuleFailure,
  loadPricingRules,
  loadPricingRulesFailure,
  loadPricingRulesSuccess,
  loadPricingRuleSuccess,
  updatePricingRule,
  updatePricingRuleFailure,
  updatePricingRuleStatus,
  updatePricingRuleStatusFailure,
  updatePricingRuleStatusSuccess,
  updatePricingRuleSuccess,
} from './pricing-rules.actions';

@Injectable()
export class PricingRulesEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly pricingRuleService: PricingRuleService,
  ) {}

  loadPricingRules$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPricingRules),
      switchMap(() =>
        this.pricingRuleService.getAllRules().pipe(
          map(pricingRules => loadPricingRulesSuccess({ pricingRules })),
          catchError(error =>
            of(loadPricingRulesFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  loadPricingRule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPricingRule),
      switchMap(({ ruleId }) =>
        this.pricingRuleService.getRule(ruleId).pipe(
          map(pricingRule => loadPricingRuleSuccess({ pricingRule })),
          catchError(error =>
            of(loadPricingRuleFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  createPricingRule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createPricingRule),
      exhaustMap(({ request }) =>
        this.pricingRuleService.createRule(request).pipe(
          map(pricingRule => createPricingRuleSuccess({ pricingRule })),
          catchError(error =>
            of(createPricingRuleFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  updatePricingRule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updatePricingRule),
      exhaustMap(({ ruleId, request }) =>
        this.pricingRuleService.updateRule(ruleId, request).pipe(
          map(pricingRule => updatePricingRuleSuccess({ pricingRule })),
          catchError(error =>
            of(updatePricingRuleFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  updatePricingRuleStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updatePricingRuleStatus),
      exhaustMap(({ ruleId, status }) =>
        this.pricingRuleService.updateStatus(ruleId, status).pipe(
          map(pricingRule =>
            updatePricingRuleStatusSuccess({ pricingRule }),
          ),
          catchError(error =>
            of(
              updatePricingRuleStatusFailure({
                error: httpErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  archivePricingRule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(archivePricingRule),
      exhaustMap(({ ruleId }) =>
        this.pricingRuleService.archiveRule(ruleId).pipe(
          map(() => archivePricingRuleSuccess({ ruleId })),
          catchError(error =>
            of(archivePricingRuleFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );
}
