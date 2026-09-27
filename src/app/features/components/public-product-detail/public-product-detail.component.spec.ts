import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockStore } from '@ngrx/store/testing';
import { PublicProductDetailComponent } from './public-product-detail.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import {
  clearProductsError,
  clearSelectedProduct,
  loadProduct,
} from '../../state/products/products.actions';
import { ProductResponse } from '../../dtos/products/product-response.dto';

type DetailInternals = {
  specRows(product: ProductResponse): { label: string; value: string }[];
  categoryLabel(category: string): string;
  productId: number;
};

const product = {
  id: 5,
  name: 'Monsoon Rain Cover',
  category: 'WEATHER',
  minimumSumInsured: 10000,
  maximumSumInsured: 500000,
  minimumTermMonths: 3,
  maximumTermMonths: 12,
  coverages: [{ id: 1 }, { id: 2 }],
  eligibilityDescription: 'Farmers in Telangana',
} as unknown as ProductResponse;

async function setup(url: string, selectedProduct: ProductResponse | null = null) {
  await TestBed.configureTestingModule({
    providers: pageTestProviders(
      { products: { ...mockRootState().products, selectedProduct } },
      [{ path: 'products/:productId', component: PublicProductDetailComponent }],
    ),
  }).compileComponents();

  const store = TestBed.inject(MockStore);
  vi.spyOn(store, 'dispatch');
  const harness = await RouterTestingHarness.create();
  const component = await harness.navigateByUrl(url, PublicProductDetailComponent);
  harness.detectChanges();
  return { harness, component, detail: component as unknown as DetailInternals, store };
}

describe('PublicProductDetailComponent', () => {
  it('loads the product from the route id', async () => {
    const { store, detail } = await setup('/products/5');

    expect(store.dispatch).toHaveBeenCalledWith(clearProductsError());
    expect(store.dispatch).toHaveBeenCalledWith(clearSelectedProduct());
    expect(store.dispatch).toHaveBeenCalledWith(loadProduct({ productId: 5 }));
    expect(detail.productId).toBe(5);
  });

  it('does not load anything for an invalid id', async () => {
    const { store } = await setup('/products/abc');

    expect(store.dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: loadProduct.type }),
    );
  });

  it('renders the selected product name', async () => {
    const { harness } = await setup('/products/5', product);

    expect(harness.routeNativeElement?.textContent).toContain('Monsoon Rain Cover');
  });

  it('builds the specification rows including eligibility', async () => {
    const { detail } = await setup('/products/5');

    const rows = detail.specRows(product);

    expect(rows.map((row) => row.label)).toEqual([
      'Minimum sum insured',
      'Maximum sum insured',
      'Policy term',
      'Coverages',
      'Eligibility',
    ]);
    expect(rows[2].value).toBe('3 - 12 months');
    expect(rows[3].value).toBe('2 included');
  });

  it('formats the category label', async () => {
    const { detail } = await setup('/products/5');

    expect(detail.categoryLabel('BUSINESS_INTERRUPTION')).toBe('BUSINESS INTERRUPTION');
  });
});
