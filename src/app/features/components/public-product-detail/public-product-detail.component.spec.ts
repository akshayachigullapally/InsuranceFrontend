import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockStore } from '@ngrx/store/testing';
import { PublicProductDetailComponent } from './public-product-detail.component';
import { loggedInAuth, mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { loadMyPolicies } from '../../state/policies/policies.actions';
import { PolicyResponse } from '../../dtos/policies/policy-response.dto';
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

async function setup(
  url: string,
  selectedProduct: ProductResponse | null = null,
  extraState: Record<string, unknown> = {},
) {
  await TestBed.configureTestingModule({
    providers: pageTestProviders(
      { products: { ...mockRootState().products, selectedProduct }, ...extraState },
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

  describe('right-hand panel', () => {
    function policy(id: number, productId: number, status: string): PolicyResponse {
      return {
        id,
        productId,
        status,
        policyNumber: `POL-${id}`,
        sumInsured: 100000,
        termMonths: 12,
      } as unknown as PolicyResponse;
    }

    function text(harness: Awaited<ReturnType<typeof setup>>['harness']): string {
      return harness.routeNativeElement?.textContent ?? '';
    }

    function links(harness: Awaited<ReturnType<typeof setup>>['harness']): string[] {
      return Array.from(harness.routeNativeElement?.querySelectorAll('a') ?? []).map(
        (a) => a.getAttribute('href') ?? '',
      );
    }

    it('sends a signed-out visitor to register or sign in and back to this product', async () => {
      const { harness } = await setup('/products/5', product);

      expect(text(harness)).toContain('Create an account to apply');
      expect(links(harness)).toContain(
        '/login?returnUrl=%2Fcustomer%2Fpolicies%2Fnew%3FproductId%3D5',
      );
    });

    it('lets a customer apply for or quote this exact product and loads their policies', async () => {
      const { harness, store } = await setup('/products/5', product, {
        auth: loggedInAuth('ROLE_CUSTOMER'),
      });

      expect(store.dispatch).toHaveBeenCalledWith(loadMyPolicies({}));
      expect(text(harness)).toContain('Apply for this policy');
      expect(links(harness)).toContain('/customer/policies/new?productId=5');
      expect(links(harness)).toContain('/customer/quotes?productId=5');
      expect(text(harness)).toContain('You do not hold this product yet.');
    });

    it("lists the customer's policies on this product and blocks a second pending application", async () => {
      const { harness } = await setup('/products/5', product, {
        auth: loggedInAuth('ROLE_CUSTOMER'),
        policies: {
          ...mockRootState().policies,
          myPolicies: [policy(1, 5, 'PENDING'), policy(2, 5, 'ACTIVE'), policy(3, 9, 'ACTIVE')],
        },
      });

      expect(text(harness)).toContain('POL-1');
      expect(text(harness)).toContain('POL-2');
      expect(text(harness)).not.toContain('POL-3');
      expect(text(harness)).toContain('waiting for underwriter review');
      expect(links(harness)).not.toContain('/customer/policies/new?productId=5');
    });

    it('shows product management links to an admin', async () => {
      const { harness, store } = await setup('/products/5', product, {
        auth: loggedInAuth('ROLE_ADMIN'),
      });

      expect(store.dispatch).not.toHaveBeenCalledWith(loadMyPolicies({}));
      expect(links(harness)).toContain('/admin/products/5');
      expect(links(harness)).toContain('/admin/products/5/threshold');
    });
  });
});
