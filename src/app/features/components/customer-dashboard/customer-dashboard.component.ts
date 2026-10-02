import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Observable, Subject, interval, startWith, takeUntil } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { loadMyPayments } from '../../state/payments/payments.actions';
import {
  selectPaidPolicyIds,
  selectPaymentsLoaded,
  selectTotalPremiumsPaid,
} from '../../state/payments/payments.selectors';
import { loadMyPayouts } from '../../state/payouts/payouts.actions';
import { selectTotalPayoutsReceived } from '../../state/payouts/payouts.selectors';
import { map } from 'rxjs/operators';
import { selectAuthUser } from '../../state/auth/auth.selectors';
import { AuthUser } from '../../../core/models/auth-user.model';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PolicyResponse } from '../../dtos/policies/policy-response.dto';
import { ClaimResponse } from '../../dtos/claims/claim-response.dto';
import { loadMyPolicies } from '../../state/policies/policies.actions';
import {
  selectActivePolicyCount,
  selectActiveSumInsured,
  selectMyPolicies,
} from '../../state/policies/policies.selectors';
import { loadMyClaims } from '../../state/claims/claims.actions';
import { selectMyClaims } from '../../state/claims/claims.selectors';
import { selectUnreadCount } from '../../state/notifications/notifications.selectors';

interface QuickAction {
  icon: string;
  label: string;
  description: string;
  routerLink: string;
  color: string;
}
import { ClimateIllustrationComponent } from '../../../shared/components/climate-illustration/climate-illustration.component';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [RouterLink, AsyncPipe, DatePipe, DecimalPipe, StatCardComponent, StatusBadgeComponent, ClimateIllustrationComponent],
  templateUrl: './customer-dashboard.component.html',
})
export class CustomerDashboardComponent implements OnInit, OnDestroy {
  readonly user$: Observable<AuthUser | null>;
  readonly policies$: Observable<PolicyResponse[]>;
  readonly claims$: Observable<ClaimResponse[]>;
  readonly activePolicyCount$: Observable<number>;
  readonly sumInsured$: Observable<number>;
  readonly claimCount$: Observable<number>;
  readonly unreadCount$: Observable<number>;
  readonly premiumsPaid$: Observable<number>;
  readonly payoutsReceived$: Observable<number>;
  readonly paidPolicyIds$: Observable<Set<number>>;
  readonly paymentsLoaded$: Observable<boolean>;
  private readonly destroy$ = new Subject<void>();

  protected readonly quickActions: QuickAction[] = [
    {
      icon: '🛒',
      label: 'Get new coverage',
      description: 'Browse parametric products',
      routerLink: '/products',
      color: 'bg-brand-50',
    },
    {
      icon: '➕',
      label: 'Apply for a policy',
      description: 'Choose sum insured & term',
      routerLink: '/customer/policies/new',
      color: 'bg-emerald-50',
    },
    {
      icon: '💬',
      label: 'Get a quote',
      description: 'Preview a premium before applying',
      routerLink: '/customer/quotes',
      color: 'bg-fuchsia-50',
    },
    {
      icon: '💳',
      label: 'Pay a premium',
      description: 'Settle a policy payment',
      routerLink: '/customer/payments',
      color: 'bg-sky-50',
    },
    {
      icon: '🏦',
      label: 'View payouts',
      description: 'Track claim payout status',
      routerLink: '/customer/payouts',
      color: 'bg-lime-50',
    },
    {
      icon: '👤',
      label: 'Update my profile',
      description: 'Addresses & contact details',
      routerLink: '/customer/profile',
      color: 'bg-indigo-50',
    },
    {
      icon: '📋',
      label: 'Report a claim',
      description: 'Manual claims intake',
      routerLink: '/customer/claims/new',
      color: 'bg-amber-50',
    },
  ];

  constructor(private readonly store: Store) {
    this.user$ = this.store.select(selectAuthUser);
    this.policies$ = this.store.select(selectMyPolicies);
    this.claims$ = this.store.select(selectMyClaims);
    this.activePolicyCount$ = this.store.select(selectActivePolicyCount);
    this.sumInsured$ = this.store.select(selectActiveSumInsured);
    this.claimCount$ = this.store.select(selectMyClaims).pipe(map((claims) => claims.length));
    this.unreadCount$ = this.store.select(selectUnreadCount);
    this.premiumsPaid$ = this.store.select(selectTotalPremiumsPaid);
    this.payoutsReceived$ = this.store.select(selectTotalPayoutsReceived);
    this.paidPolicyIds$ = this.store.select(selectPaidPolicyIds);
    this.paymentsLoaded$ = this.store.select(selectPaymentsLoaded);
  }

  ngOnInit(): void {
    this.store.dispatch(loadMyPolicies({}));
    this.store.dispatch(loadMyClaims({}));
    // Keep premiums paid / payouts received current while the dashboard is open.
    interval(15_000)
      .pipe(startWith(0))
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.store.dispatch(loadMyPayments());
        this.store.dispatch(loadMyPayouts());
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
