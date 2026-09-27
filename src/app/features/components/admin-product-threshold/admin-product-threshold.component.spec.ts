import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockStore } from '@ngrx/store/testing';
import { AdminProductThresholdComponent } from './admin-product-threshold.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import {
  clearProductThresholdUpdate,
  clearProductsError,
  clearSelectedProduct,
  loadAdminProduct,
  loadProductThresholdHistory,
  updateProductThreshold,
} from '../../state/products/products.actions';

type ThresholdInternals = {
  onSubmit(): void;
  productId: number;
  invalidProductId: boolean;
};

const product = {
  id: 3,
  name: 'Rain Cover',
  perilCode: 'EXCESS_RAINFALL',
  measurementType: 'RAINFALL',
  measurementUnit: 'MM',
  thresholdValue: 150,
  comparisonOperator: 'GREATER_THAN_OR_EQUAL',
  aggregationType: 'SUM',
  observationWindowHours: 24,
  minimumObservationCount: 1,
  triggerDescription: 'Heavy rain',
};

async function setup(url: string) {
  await TestBed.configureTestingModule({
    providers: pageTestProviders(
      { products: { ...mockRootState().products, selectedProduct: product } },
      [{ path: 'admin/products/:productId/threshold', component: AdminProductThresholdComponent }],
    ),
  }).compileComponents();

  const store = TestBed.inject(MockStore);
  vi.spyOn(store, 'dispatch');
  const harness = await RouterTestingHarness.create();
  const component = await harness.navigateByUrl(url, AdminProductThresholdComponent);
  return { component, page: component as unknown as ThresholdInternals, store };
}

describe('AdminProductThresholdComponent', () => {
  it('flags an invalid product id', async () => {
    const { page, store } = await setup('/admin/products/0/threshold');

    expect(page.invalidProductId).toBe(true);
    expect(store.dispatch).not.toHaveBeenCalledWith(loadAdminProduct({ productId: 0 }));
  });

  it('loads the product and its threshold history', async () => {
    const { page, store } = await setup('/admin/products/3/threshold');

    expect(page.productId).toBe(3);
    expect(store.dispatch).toHaveBeenCalledWith(clearProductsError());
    expect(store.dispatch).toHaveBeenCalledWith(clearProductThresholdUpdate());
    expect(store.dispatch).toHaveBeenCalledWith(clearSelectedProduct());
    expect(store.dispatch).toHaveBeenCalledWith(loadAdminProduct({ productId: 3 }));
    expect(store.dispatch).toHaveBeenCalledWith(loadProductThresholdHistory({ productId: 3 }));
  });

  it('prefills the form from the loaded product', async () => {
    const { component } = await setup('/admin/products/3/threshold');

    expect(component.form.value.thresholdValue).toBe(150);
    expect(component.form.value.aggregationType).toBe('SUM');
  });

  it('does not submit a zero threshold', async () => {
    const { component, page, store } = await setup('/admin/products/3/threshold');
    component.form.patchValue({ thresholdValue: 0 });

    page.onSubmit();

    expect(store.dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: updateProductThreshold.type }),
    );
  });

  it('submits the new threshold and keeps the other trigger fields', async () => {
    const { component, page, store } = await setup('/admin/products/3/threshold');
    component.form.patchValue({ thresholdValue: '175', changeReason: '  Monsoon review  ' });

    page.onSubmit();

    expect(store.dispatch).toHaveBeenCalledWith(
      updateProductThreshold({
        productId: 3,
        request: {
          perilCode: 'EXCESS_RAINFALL',
          measurementType: 'RAINFALL',
          measurementUnit: 'MM',
          thresholdValue: 175,
          comparisonOperator: 'GREATER_THAN_OR_EQUAL',
          aggregationType: 'SUM',
          observationWindowHours: 24,
          minimumObservationCount: 1,
          triggerDescription: 'Heavy rain',
          changeReason: 'Monsoon review',
        },
      }),
    );
  });
});
