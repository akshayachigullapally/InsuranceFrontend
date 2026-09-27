import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
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

  it('shows an error and disables the zone field when zones fail to load', async () => {
    const { component, page } = await setup('/customer/policies/new', throwError(() => new Error('down')));

    expect(page.zonesError).toBe('Location zones could not be loaded. Please try again.');
    expect(component.form.controls.locationZoneId.disabled).toBe(true);
  });

  it('preselects the product from the query string with its minimums', async () => {
    const { component, page } = await setup('/customer/policies/new?productId=1');

    expect(page.selectedProduct?.id).toBe(1);
    expect(component.form.controls.sumInsured.value).toBe(10000);
    expect(component.form.controls.termMonths.value).toBe(3);
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

  it('ignores a quote that is not accepted', async () => {
    const quote = { id: 9, status: 'CREATED', productId: 1 };
    const { page } = await setup('/customer/policies/new?quoteId=9', undefined, of(quote));

    expect(page.quoteId).toBeNull();
    expect(page.appliedQuote).toBeNull();
  });

  it('does not submit without a zone', async () => {
    const { page, store } = await setup('/customer/policies/new?productId=1');

    page.onSubmit();

    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: createPolicy.type }));
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

  it('switches between product and custom mode', async () => {
    const { page, store } = await setup();

    page.setMode('CUSTOM');

    expect(page.mode).toBe('CUSTOM');
    expect(store.dispatch).toHaveBeenCalledWith(clearPoliciesError());
    expect(page.isOtherSelected('OTHER')).toBe(true);
  });
});
