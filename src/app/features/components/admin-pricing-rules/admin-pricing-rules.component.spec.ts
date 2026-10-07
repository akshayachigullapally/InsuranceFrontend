import { DialogService } from '../../../shared/services/dialog.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { AdminPricingRulesComponent } from './admin-pricing-rules.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import {
  archivePricingRule,
  clearPricingRulesError,
  createPricingRule,
  loadPricingRules,
  updatePricingRuleStatus,
} from '../../state/pricing-rules/pricing-rules.actions';
import { loadAdminProducts } from '../../state/products/products.actions';
import { loadZones } from '../../state/zones/zones.actions';
import { PricingRuleResponse } from '../../dtos/financial/pricing-rule-response.dto';
import { ProductResponse } from '../../dtos/products/product-response.dto';
import { ZoneResponse } from '../../dtos/zones/zone-response.dto';

type RulesInternals = {
  openCreate(): void;
  openEdit(rule: PricingRuleResponse): void;
  submit(): void;
  changeStatus(rule: PricingRuleResponse, event: Event): void;
  archive(rule: PricingRuleResponse): void;
  productName(products: ProductResponse[], productId: number): string;
  zoneName(zones: ZoneResponse[], zoneId: number | null): string;
  formOpen: boolean;
};

describe('AdminPricingRulesComponent', () => {
  let fixture: ComponentFixture<AdminPricingRulesComponent>;
  let component: AdminPricingRulesComponent;
  let page: RulesInternals;
  let store: MockStore;
  const rule = {
    id: 5,
    productId: 1,
    locationZoneId: null,
    baseAnnualRate: 0.02,
    minimumPremium: 500,
    termFactor: 1,
    locationFactor: 1.2,
    effectiveFrom: '2026-06-01',
    effectiveTo: null,
    status: 'ACTIVE',
  } as unknown as PricingRuleResponse;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPricingRulesComponent],
      providers: pageTestProviders(),
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(AdminPricingRulesComponent);
    component = fixture.componentInstance;
    page = component as unknown as RulesInternals;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads rules, products and zones on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(clearPricingRulesError());
    expect(store.dispatch).toHaveBeenCalledWith(loadPricingRules());
    expect(store.dispatch).toHaveBeenCalledWith(loadAdminProducts());
    expect(store.dispatch).toHaveBeenCalledWith(loadZones({}));
  });

  it('creates a rule from valid input', () => {
    page.openCreate();
    component.form.patchValue({ productId: 1, baseAnnualRate: 0.03, minimumPremium: 750, effectiveFrom: '2026-10-01' });

    page.submit();

    expect(store.dispatch).toHaveBeenCalledWith(
      createPricingRule({
        request: {
          productId: 1,
          baseAnnualRate: 0.03,
          minimumPremium: 750,
          termFactor: 1,
          locationZoneId: null,
          locationFactor: 1,
          effectiveFrom: '2026-10-01',
          effectiveTo: undefined,
        } as never,
      }),
    );
    expect(page.formOpen).toBe(false);
  });

  it('changes status and archives with confirmation', async () => {
    page.changeStatus(rule, { target: { value: 'INACTIVE' } } as unknown as Event);
    expect(store.dispatch).toHaveBeenCalledWith(updatePricingRuleStatus({ ruleId: 5, status: 'INACTIVE' as never }));

    vi.spyOn(TestBed.inject(DialogService), 'confirm').mockResolvedValue(true);
    await page.archive(rule);
    expect(store.dispatch).toHaveBeenCalledWith(archivePricingRule({ ruleId: 5 }));
  });
});
