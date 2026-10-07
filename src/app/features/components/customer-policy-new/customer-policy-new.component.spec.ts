import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockStore } from '@ngrx/store/testing';
import { Observable, of } from 'rxjs';
import { CustomerPolicyNewComponent } from './customer-policy-new.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { QuoteService } from '../../services/quote.service';
import { ZoneService } from '../../services/zone.service';
import { clearProductsError, loadProducts } from '../../state/products/products.actions';
import { clearPoliciesError, createPolicy } from '../../state/policies/policies.actions';

type PolicyNewInternals = {
  mode: 'PRODUCT' | 'CUSTOM';
  selectedProduct: { id: number } | null;
  zones: unknown[];
  zonesError: string | null;
  appliedQuote: unknown;
  quoteId: number | null;
  setMode(mode: 'PRODUCT' | 'CUSTOM'): void;
  isOtherSelected(value: string | null): boolean;
  onSubmit(): void;
};

const products = [
  {
    id: 1,
    name: 'Rain Cover',
    status: 'ACTIVE',
    minimumSumInsured: 10000,
    maximumSumInsured: 500000,
    minimumTermMonths: 3,
    maximumTermMonths: 12,
    perilCode: 'EXCESS_RAINFALL',
    measurementType: 'RAINFALL',
    comparisonOperator: 'GREATER_THAN_OR_EQUAL',
    thresholdValue: 150,
    observationWindowHours: 24,
    aggregationType: 'SUM',
    minimumObservationCount: 1,
    coverages: [],
  },
];

async function setup(
  url = '/customer/policies/new',
  zones: Observable<unknown> = of([{ id: 2, zoneName: 'Hyderabad Central Zone' }]),
  quote: Observable<unknown> = of(null),
) {
  await TestBed.configureTestingModule({
    providers: [
      ...pageTestProviders(
        { products: { ...mockRootState().products, products } },
        [{ path: 'customer/policies/new', component: CustomerPolicyNewComponent }],
      ),
      { provide: ZoneService, useValue: { getActiveZones: () => zones } },
      { provide: QuoteService, useValue: { getQuote: vi.fn().mockReturnValue(quote) } },
    ],
  }).compileComponents();

  const store = TestBed.inject(MockStore);
  vi.spyOn(store, 'dispatch');
  const harness = await RouterTestingHarness.create();
  const component = await harness.navigateByUrl(url, CustomerPolicyNewComponent);
  return { component, page: component as unknown as PolicyNewInternals, store };
}

describe('CustomerPolicyNewComponent', () => {
  it('loads products and zones on init', async () => {
    const { component, page, store } = await setup();

    expect(store.dispatch).toHaveBeenCalledWith(clearProductsError());
    expect(store.dispatch).toHaveBeenCalledWith(clearPoliciesError());
    expect(store.dispatch).toHaveBeenCalledWith(loadProducts());
    expect(page.zones.length).toBe(1);
    expect(component.form.controls.locationZoneId.enabled).toBe(true);
  });

  it('enforces the product sum insured and term limits', async () => {
    const { component } = await setup('/customer/policies/new?productId=1');

    component.form.controls.sumInsured.setValue(600000);
    component.form.controls.termMonths.setValue(24);

    expect(component.form.controls.sumInsured.hasError('max')).toBe(true);
    expect(component.form.controls.termMonths.hasError('max')).toBe(true);
  });

  it('applies an accepted quote and locks its values', async () => {
    const quote = { id: 9, status: 'ACCEPTED', productId: 1, locationZoneId: 2, sumInsured: 200000, termMonths: 6 };
    const { component, page } = await setup('/customer/policies/new?quoteId=9', undefined, of(quote));

    expect(page.quoteId).toBe(9);
    expect(component.form.controls.productId.disabled).toBe(true);
    expect(component.form.controls.sumInsured.value).toBe(200000);
    expect(component.form.controls.locationZoneId.value).toBe(2);
  });

  it('submits the policy with the product trigger', async () => {
    const { component, page, store } = await setup('/customer/policies/new?productId=1');
    component.form.patchValue({ sumInsured: 100000, termMonths: 12, locationZoneId: 2 });

    page.onSubmit();

    expect(store.dispatch).toHaveBeenCalledWith(
      createPolicy({
        request: expect.objectContaining({
          productId: 1,
          sumInsured: 100000,
          termMonths: 12,
          locationZoneId: 2,
          perilCode: 'EXCESS_RAINFALL',
          triggerThreshold: 150,
        }),
      }),
    );
  });
});
