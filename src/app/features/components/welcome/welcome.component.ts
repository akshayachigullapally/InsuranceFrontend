import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { loadProducts } from '../../state/products/products.actions';
import { selectProducts } from '../../state/products/products.selectors';
import { ProductResponse } from '../../dtos/products/product-response.dto';

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface Step {
  number: string;
  title: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
}

interface TrustItem {
  icon: string;
  label: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  WEATHER: '🌦️',
  FLOOD: '🌊',
  AGRICULTURE: '🌾',
  BUSINESS_INTERRUPTION: '🏢',
  TRAVEL: '✈️',
  CYCLONE: '🌀',
  OTHER: '🛡️',
};

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink, AsyncPipe, DecimalPipe],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
})
export class WelcomeComponent implements OnInit, OnDestroy {
  readonly products$: Observable<ProductResponse[]>;
  private readonly destroy$ = new Subject<void>();

  readonly features: Feature[] = [
    {
      icon: '⚡',
      title: 'Automatic evaluation',
      description: 'Weather observations are evaluated against your trigger thresholds in real time. No manual claims submission for qualifying events.',
      color: 'bg-brand-50',
    },
    {
      icon: '📡',
      title: 'Live data sources',
      description: 'Rainfall, temperature, wind speed, river level and soil moisture streamed from reliable monitoring sources.',
      color: 'bg-cyan-50',
    },
    {
      icon: '🧩',
      title: 'Transparent triggers',
      description: 'Every policy shows exactly what triggers a payout — the measurement, the aggregation window and the threshold.',
      color: 'bg-amber-50',
    },
    {
      icon: '💰',
      title: 'Fast payouts',
      description: 'Verified trigger events feed straight into claims and financial processing for payments in days, not months.',
      color: 'bg-emerald-50',
    },
    {
      icon: '🛡️',
      title: 'Flexible coverage',
      description: 'Choose your sum insured and term from clear product limits, then keep control of every policy in one dashboard.',
      color: 'bg-indigo-50',
    },
    {
      icon: '📱',
      title: 'Full self-service',
      description: 'Manage your profile, addresses, policies, claims and notifications entirely online.',
      color: 'bg-rose-50',
    },
  ];

  readonly steps: Step[] = [
    { number: '1', title: 'Register & verify', description: 'Create a customer account and complete your profile with your primary address.' },
    { number: '2', title: 'Choose coverage', description: 'Browse active products and apply with a sum insured and term that suits your risk.' },
    { number: '3', title: 'We monitor the data', description: 'Underwriters approve your policy and our engine watches the weather feeds continuously.' },
    { number: '4', title: 'Get paid automatically', description: 'When a trigger matches, an event is verified and your eligible claim is processed straight through.' },
  ];

  readonly stats: Stat[] = [
    { value: '10+', label: 'Active products' },
    { value: '98%', label: 'Automatic payouts' },
    { value: '24/7', label: 'Live monitoring' },
    { value: '₹65B+', label: 'Coverage in force' },
  ];

  readonly trustItems: TrustItem[] = [
    { icon: '🌊', label: 'IMD weather feeds' },
    { icon: '🏛️', label: 'Regulated & audited' },
    { icon: '🔒', label: 'Bank-grade security' },
    { icon: '⚡', label: 'Straight-through claims' },
  ];

  constructor(private readonly store: Store) {
    this.products$ = this.store.select(selectProducts);
  }

  ngOnInit(): void {
    this.store.dispatch(loadProducts());
    this.products$.pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected categoryIcon(category: string): string {
    return CATEGORY_ICONS[category] ?? CATEGORY_ICONS['OTHER'];
  }
}