import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { selectAdminProducts } from '../../state/products/products.selectors';
import { selectActiveProductCount } from '../../state/products/products.selectors';
import { selectAdminActivePolicyCount } from '../../state/policies/policies.selectors';
import { selectSuccessfulPayoutAmount } from '../../state/payouts/payouts.selectors';
import { selectTotalUserCount } from '../../state/users/users.selectors';
import { ProductResponse } from '../../dtos/products/product-response.dto';
import { loadAdminProducts } from '../../state/products/products.actions';
import { loadAdminPolicies } from '../../state/policies/policies.actions';
import { loadPayouts } from '../../state/payouts/payouts.actions';
import { loadUsers } from '../../state/users/users.actions';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

interface AdminLink {
  icon: string;
  label: string;
  description: string;
  routerLink: string;
  color: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, AsyncPipe, StatCardComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  readonly products$: Observable<ProductResponse[]>;
  readonly userCount$: Observable<number>;
  readonly activePolicyCount$: Observable<number>;
  readonly activeProductCount$: Observable<number>;
  readonly totalPayouts$: Observable<number>;

  protected readonly adminLinks: AdminLink[] = [
    { icon: '👥', label: 'Users', description: 'Provision & manage accounts', routerLink: '/admin/users', color: 'bg-blue-50' },
    { icon: '📦', label: 'Products', description: 'Insurance product catalogue', routerLink: '/admin/products', color: 'bg-emerald-50' },
    { icon: '📄', label: 'Policies', description: 'All policy applications', routerLink: '/admin/policies', color: 'bg-indigo-50' },
    { icon: '📋', label: 'Claims', description: 'Platform-wide claim activity', routerLink: '/admin/claims', color: 'bg-amber-50' },
    { icon: '🌍', label: 'Zones', description: 'Trigger zones & boundaries', routerLink: '/admin/zones', color: 'bg-cyan-50' },
    { icon: '🌀', label: 'Perils', description: 'Peril catalogue', routerLink: '/admin/perils', color: 'bg-violet-50' },
    { icon: '⚙️', label: 'Triggers', description: 'Thresholds & windows', routerLink: '/admin/trigger-definitions', color: 'bg-rose-50' },
    { icon: '📡', label: 'Observations', description: 'Raw weather data', routerLink: '/admin/observations', color: 'bg-teal-50' },
    { icon: '✅', label: 'Evaluations', description: 'Trigger engine output', routerLink: '/admin/evaluations', color: 'bg-green-50' },
    { icon: '🚨', label: 'Events', description: 'Trigger event history', routerLink: '/admin/trigger-events', color: 'bg-orange-50' },
    { icon: '🔔', label: 'Notifications', description: 'Outbound message log', routerLink: '/admin/notifications', color: 'bg-slate-100' },
    { icon: '📝', label: 'Audit Log', description: 'System activity trail', routerLink: '/admin/audit', color: 'bg-gray-100' },
  ];

  constructor(private readonly store: Store) {
    this.products$ = this.store.select(selectAdminProducts);
    this.userCount$ = this.store.select(selectTotalUserCount);
    this.activePolicyCount$ = this.store.select(selectAdminActivePolicyCount);
    this.activeProductCount$ = this.store.select(selectActiveProductCount);
    this.totalPayouts$ = this.store.select(selectSuccessfulPayoutAmount);
  }

  ngOnInit(): void {
    this.store.dispatch(loadUsers({}));
    this.store.dispatch(loadAdminPolicies({}));
    this.store.dispatch(loadAdminProducts());
    this.store.dispatch(loadPayouts());
  }
}