import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, map, take } from 'rxjs';
import { ProductResponse } from '../../dtos/products/product-response.dto';
import {
  clearProductsError,
  clearSelectedProduct,
  loadProduct,
} from '../../state/products/products.actions';
import {
  selectProductsError,
  selectProductsLoading,
  selectSelectedProduct,
} from '../../state/products/products.selectors';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ParametricTriggerCardComponent } from '../../../shared/components/parametric-trigger-card/parametric-trigger-card.component';
import { TriggerCondition } from '../../dtos/triggers/trigger-condition.dto';
import { PolicyResponse } from '../../dtos/policies/policy-response.dto';
import { ROLES } from '../../../core/constants/roles';
import { selectAuthRole, selectIsAuthenticated } from '../../state/auth/auth.selectors';
import { loadMyPolicies } from '../../state/policies/policies.actions';
import { selectMyPolicies } from '../../state/policies/policies.selectors';
import { buildTriggerSentence } from '../../utils/trigger-display';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

const STATUS_ORDER = ['PENDING', 'ACTIVE', 'EXPIRED', 'REJECTED', 'CANCELLED'];

interface SpecRow {
  label: string;
  value: string;
}

@Component({
  selector: 'app-public-product-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    DecimalPipe,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    ParametricTriggerCardComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './public-product-detail.component.html',
})
export class PublicProductDetailComponent implements OnInit, OnDestroy {
  readonly product$: Observable<ProductResponse | null>;
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<string | null>;
  /** Who is looking: drives the right-hand panel. */
  readonly viewer$: Observable<'guest' | 'customer' | 'admin' | 'staff'>;
  /** The signed-in customer's policies on this product (pending first). */
  readonly myPoliciesForProduct$: Observable<PolicyResponse[]>;

  protected productId = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store,
  ) {
    this.product$ = this.store.select(selectSelectedProduct);
    this.loading$ = this.store.select(selectProductsLoading);
    this.error$ = this.store.select(selectProductsError);
    this.viewer$ = combineLatest([
      this.store.select(selectIsAuthenticated),
      this.store.select(selectAuthRole),
    ]).pipe(
      map(([signedIn, role]) => {
        if (!signedIn) return 'guest';
        if (role === ROLES.CUSTOMER) return 'customer';
        return role === ROLES.ADMIN ? 'admin' : 'staff';
      }),
    );
    this.myPoliciesForProduct$ = this.store
      .select(selectMyPolicies)
      .pipe(
        map((policies) =>
          policies
            .filter((policy) => policy.productId === this.productId)
            .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)),
        ),
      );
  }

  ngOnInit(): void {
    this.store.dispatch(clearProductsError());
    this.store.dispatch(clearSelectedProduct());

    const productId = Number(this.route.snapshot.paramMap.get('productId'));

    if (!Number.isInteger(productId) || productId <= 0) {
      return;
    }

    this.productId = productId;
    this.store.dispatch(loadProduct({ productId }));

    this.store
      .select(selectAuthRole)
      .pipe(take(1))
      .subscribe((role) => {
        if (role === ROLES.CUSTOMER) {
          this.store.dispatch(loadMyPolicies({}));
        }
      });
  }

  /** Where a signed-out visitor returns after signing in or registering. */
  protected applyReturnUrl(productId: number): string {
    return `/customer/policies/new?productId=${productId}`;
  }

  protected hasPending(policies: PolicyResponse[]): boolean {
    return policies.some((policy) => policy.status === 'PENDING');
  }

  protected triggerSentence(product: ProductResponse): string {
    return product.humanReadableTrigger || buildTriggerSentence(this.triggerCondition(product));
  }

  ngOnDestroy(): void {
    this.store.dispatch(clearSelectedProduct());
    this.store.dispatch(clearProductsError());
  }

  protected specRows(product: ProductResponse): SpecRow[] {
    const rows: SpecRow[] = [
      {
        label: 'Minimum sum insured',
        value: `₹ ${product.minimumSumInsured.toLocaleString('en-IN')}`,
      },
      {
        label: 'Maximum sum insured',
        value: `₹ ${product.maximumSumInsured.toLocaleString('en-IN')}`,
      },
      {
        label: 'Policy term',
        value: `${product.minimumTermMonths} - ${product.maximumTermMonths} months`,
      },
      {
        label: 'Coverages',
        value: `${product.coverages.length} included`,
      },
    ];

    if (product.eligibilityDescription) {
      rows.push({
        label: 'Eligibility',
        value: product.eligibilityDescription,
      });
    }

    return rows;
  }

  protected categoryLabel(category: string): string {
    return category.replaceAll('_', ' ');
  }

  protected triggerCondition(product: ProductResponse): TriggerCondition {
    return {
      perilCode: product.perilCode,
      measurementType: product.measurementType,
      measurementUnit: product.measurementUnit,
      thresholdValue: product.thresholdValue,
      comparisonOperator: product.comparisonOperator,
      aggregationType: product.aggregationType,
      observationWindowHours: product.observationWindowHours,
      minimumObservationCount: product.minimumObservationCount,
      triggerDescription: product.triggerDescription,
      humanReadableTrigger: product.humanReadableTrigger,
    };
  }
}
