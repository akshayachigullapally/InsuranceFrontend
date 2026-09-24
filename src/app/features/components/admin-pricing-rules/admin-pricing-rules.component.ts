import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import {
  PRICING_RULE_MANAGEABLE_STATUSES,
  PricingRuleManageableStatus,
  PricingRuleRequest,
  PricingRuleResponse,
} from '../../dtos/financial/pricing-rule-response.dto';
import { ProductResponse } from '../../dtos/products/product-response.dto';
import { ZoneResponse } from '../../dtos/zones/zone-response.dto';
import {
  archivePricingRule,
  clearPricingRulesError,
  clearSelectedPricingRule,
  createPricingRule,
  loadPricingRules,
  updatePricingRule,
  updatePricingRuleStatus,
} from '../../state/pricing-rules/pricing-rules.actions';
import {
  selectPricingRules,
  selectPricingRulesError,
  selectPricingRulesLoading,
  selectPricingRulesSaving,
  selectUpdatingRuleId,
} from '../../state/pricing-rules/pricing-rules.selectors';
import { loadAdminProducts } from '../../state/products/products.actions';
import { selectAdminProducts } from '../../state/products/products.selectors';
import { loadZones } from '../../state/zones/zones.actions';
import { selectZones } from '../../state/zones/zones.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface PricingRuleForm {
  productId: FormControl<number | null>;
  locationZoneId: FormControl<number | null>;
  baseAnnualRate: FormControl<number | null>;
  minimumPremium: FormControl<number | null>;
  termFactor: FormControl<number | null>;
  locationFactor: FormControl<number | null>;
  effectiveFrom: FormControl<string>;
  effectiveTo: FormControl<string>;
}

@Component({
  selector: 'app-admin-pricing-rules',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './admin-pricing-rules.component.html',
  styleUrl: './admin-pricing-rules.component.css',
})
export class AdminPricingRulesComponent implements OnInit, OnDestroy {
  readonly rules$: Observable<PricingRuleResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly saving$: Observable<boolean>;
  readonly updatingRuleId$: Observable<number | null>;
  readonly error$: Observable<string | null>;
  readonly products$: Observable<ProductResponse[]>;
  readonly zones$: Observable<ZoneResponse[]>;

  protected readonly statuses = PRICING_RULE_MANAGEABLE_STATUSES;
  protected formOpen = false;
  protected editingRule: PricingRuleResponse | null = null;

  readonly form = new FormGroup<PricingRuleForm>({
    productId: new FormControl<number | null>(null, Validators.required),
    locationZoneId: new FormControl<number | null>(null),
    baseAnnualRate: new FormControl<number | null>(
      null,
      [Validators.required, Validators.min(0.000001), Validators.max(1)],
    ),
    minimumPremium: new FormControl<number | null>(
      null,
      [Validators.required, Validators.min(0)],
    ),
    termFactor: new FormControl<number | null>(
      1,
      [Validators.required, Validators.min(0.0001), Validators.max(10)],
    ),
    locationFactor: new FormControl<number | null>(
      1,
      [Validators.required, Validators.min(0.0001), Validators.max(10)],
    ),
    effectiveFrom: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    effectiveTo: new FormControl('', { nonNullable: true }),
  });

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store) {
    this.rules$ = this.store.select(selectPricingRules);
    this.loading$ = this.store.select(selectPricingRulesLoading);
    this.saving$ = this.store.select(selectPricingRulesSaving);
    this.updatingRuleId$ = this.store.select(selectUpdatingRuleId);
    this.error$ = this.store.select(selectPricingRulesError);
    this.products$ = this.store.select(selectAdminProducts);
    this.zones$ = this.store.select(selectZones);
  }

  ngOnInit(): void {
    this.store.dispatch(clearPricingRulesError());
    this.store.dispatch(loadPricingRules());
    this.store.dispatch(loadAdminProducts());
    this.store.dispatch(loadZones({}));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearSelectedPricingRule());
    this.store.dispatch(clearPricingRulesError());
  }

  protected productName(products: ProductResponse[], productId: number): string {
    return products.find(product => product.id === productId)?.name
      ?? `Product #${productId}`;
  }

  protected zoneName(zones: ZoneResponse[], zoneId: number | null): string {
    if (zoneId === null) return 'All zones (default)';
    return zones.find(zone => zone.id === zoneId)?.zoneName ?? `Zone #${zoneId}`;
  }

  protected openCreate(): void {
    this.store.dispatch(clearPricingRulesError());
    this.editingRule = null;
    this.form.reset({
      productId: null,
      locationZoneId: null,
      baseAnnualRate: null,
      minimumPremium: null,
      termFactor: 1,
      locationFactor: 1,
      effectiveFrom: new Date().toISOString().slice(0, 10),
      effectiveTo: '',
    });
    this.formOpen = true;
  }

  protected openEdit(rule: PricingRuleResponse): void {
    this.store.dispatch(clearPricingRulesError());
    this.editingRule = rule;
    this.form.reset({
      productId: rule.productId,
      locationZoneId: rule.locationZoneId,
      baseAnnualRate: rule.baseAnnualRate,
      minimumPremium: rule.minimumPremium,
      termFactor: rule.termFactor,
      locationFactor: rule.locationFactor,
      effectiveFrom: rule.effectiveFrom,
      effectiveTo: rule.effectiveTo ?? '',
    });
    this.formOpen = true;
  }

  protected closeForm(): void {
    this.formOpen = false;
    this.editingRule = null;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (
      raw.productId === null ||
      raw.baseAnnualRate === null ||
      raw.minimumPremium === null ||
      raw.termFactor === null ||
      raw.locationFactor === null
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const request: PricingRuleRequest = {
      productId: raw.productId,
      baseAnnualRate: raw.baseAnnualRate,
      minimumPremium: raw.minimumPremium,
      termFactor: raw.termFactor,
      locationZoneId: raw.locationZoneId,
      locationFactor: raw.locationFactor,
      effectiveFrom: raw.effectiveFrom,
      effectiveTo: raw.effectiveTo || undefined,
    };

    if (this.editingRule) {
      this.store.dispatch(updatePricingRule({
        ruleId: this.editingRule.id,
        request,
      }));
    } else {
      this.store.dispatch(createPricingRule({ request }));
    }

    this.formOpen = false;
    this.editingRule = null;
  }

  protected changeStatus(rule: PricingRuleResponse, event: Event): void {
    const status = (event.target as HTMLSelectElement)
      .value as PricingRuleManageableStatus;

    if (status === rule.status) return;

    this.store.dispatch(updatePricingRuleStatus({
      ruleId: rule.id,
      status,
    }));
  }

  protected archive(rule: PricingRuleResponse): void {
    const confirmed = window.confirm(
      `Archive this pricing rule for product #${rule.productId}?`,
    );

    if (confirmed) {
      this.store.dispatch(archivePricingRule({ ruleId: rule.id }));
    }
  }

  protected isUpdating(ruleId: number, updatingRuleId: number | null): boolean {
    return ruleId === updatingRuleId;
  }
}
