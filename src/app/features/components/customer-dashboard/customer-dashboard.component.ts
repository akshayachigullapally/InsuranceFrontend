import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
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

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [RouterLink, AsyncPipe, DatePipe, StatCardComponent, StatusBadgeComponent],
  templateUrl: './customer-dashboard.component.html',
  styleUrl: './customer-dashboard.component.css',
})
export class CustomerDashboardComponent implements OnInit {
  readonly user$: Observable<AuthUser | null>;
  readonly policies$: Observable<PolicyResponse[]>;
  readonly claims$: Observable<ClaimResponse[]>;
  readonly activePolicyCount$: Observable<number>;
  readonly sumInsured$: Observable<number>;
  readonly claimCount$: Observable<number>;
  readonly unreadCount$: Observable<number>;

  protected readonly quickActions: QuickAction[] = [
    { icon: '🛒', label: 'Get new coverage', description: 'Browse parametric products', routerLink: '/products', color: 'bg-brand-50' },
    { icon: '➕', label: 'Apply for a policy', description: 'Choose sum insured & term', routerLink: '/customer/policies/new', color: 'bg-emerald-50' },
    { icon: '👤', label: 'Update my profile', description: 'Addresses & contact details', routerLink: '/customer/profile', color: 'bg-indigo-50' },
    { icon: '📋', label: 'Report a claim', description: 'Manual claims intake', routerLink: '/customer/claims/new', color: 'bg-amber-50' },
  ];

  constructor(private readonly store: Store) {
    this.user$ = this.store.select(selectAuthUser);
    this.policies$ = this.store.select(selectMyPolicies);
    this.claims$ = this.store.select(selectMyClaims);
    this.activePolicyCount$ = this.store.select(selectActivePolicyCount);
    this.sumInsured$ = this.store.select(selectActiveSumInsured);
    this.claimCount$ = this.store.select(selectMyClaims).pipe(map(claims => claims.length));
    this.unreadCount$ = this.store.select(selectUnreadCount);
  }

  ngOnInit(): void {
    this.store.dispatch(loadMyPolicies({}));
    this.store.dispatch(loadMyClaims({}));
  }
}