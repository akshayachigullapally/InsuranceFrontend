import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockStore } from '@ngrx/store/testing';
import { AdminProductThresholdComponent } from './admin-product-threshold.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import {
  loadAdminProduct,
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
  productCode: 'WEATHER-001',
  category: 'WEATHER',
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
