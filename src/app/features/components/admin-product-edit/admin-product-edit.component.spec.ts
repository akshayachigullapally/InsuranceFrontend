import { TestBed } from '@angular/core/testing';
import { FormArray, FormGroup } from '@angular/forms';
import { Action } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { AdminProductEditComponent } from './admin-product-edit.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { ToastService } from '../../../shared/services/toast.service';
import {
  clearProductsError,
  clearSelectedProduct,
  loadAdminProduct,
  updateProduct,
  updateProductFailure,
  updateProductSuccess,
} from '../../state/products/products.actions';
import { ProductResponse } from '../../dtos/products/product-response.dto';

type EditInternals = {
  form: FormGroup | null;
  product: ProductResponse | null;
  invalidProductId: boolean;
  rangeError: string | null;
  coverages: FormArray;
  triggerConfigured(): boolean;
  addCoverage(): void;
  removeCoverage(index: number): void;
  onSubmit(): void;
};

const product = {
  id: 5,
  productCode: 'WEATHER-001',
  name: 'Rain Cover',
  category: 'WEATHER',
  description: 'Monsoon cover',
  status: 'ACTIVE',
  minimumSumInsured: 10000,
  maximumSumInsured: 500000,
  minimumTermMonths: 3,
  maximumTermMonths: 12,
  eligibilityDescription: null,
  perilCode: 'EXCESS_RAINFALL',
  measurementType: 'RAINFALL',
  measurementUnit: 'MM',
  thresholdValue: 150,
  comparisonOperator: 'GREATER_THAN_OR_EQUAL',
  aggregationType: 'SUM',
  observationWindowHours: 24,
  minimumObservationCount: 1,
  triggerDescription: null,
  coverages: [
    { coverageCode: 'CROP', name: 'Crop loss', description: null, coverageLimit: 100000, mandatory: true, active: true },
  ],
} as unknown as ProductResponse;

async function setup(url: string) {
  const actions$ = new Subject<Action>();
  const toast = { show: vi.fn() };
  await TestBed.configureTestingModule({
    providers: [
      ...pageTestProviders(
        { products: { ...mockRootState().products, selectedProduct: product } },
        [{ path: 'admin/products/:productId/edit', component: AdminProductEditComponent }],
      ),
      provideMockActions(() => actions$),
      { provide: ToastService, useValue: toast },
    ],
  }).compileComponents();

  const store = TestBed.inject(MockStore);
  vi.spyOn(store, 'dispatch');
  const harness = await RouterTestingHarness.create();
  const component = await harness.navigateByUrl(url, AdminProductEditComponent);
  return { page: component as unknown as EditInternals, store, actions$, toast };
}

describe('AdminProductEditComponent', () => {
  it('flags an invalid product id', async () => {
    const { page, store } = await setup('/admin/products/abc/edit');

    expect(page.invalidProductId).toBe(true);
    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: loadAdminProduct.type }));
  });

  it('loads the product and builds the form from it', async () => {
    const { page, store } = await setup('/admin/products/5/edit');

    expect(store.dispatch).toHaveBeenCalledWith(clearProductsError());
    expect(store.dispatch).toHaveBeenCalledWith(clearSelectedProduct());
    expect(store.dispatch).toHaveBeenCalledWith(loadAdminProduct({ productId: 5 }));
    expect(page.form?.value.productCode).toBe('WEATHER-001');
    expect(page.coverages.length).toBe(1);
    expect(page.triggerConfigured()).toBe(true);
  });

  it('keeps at least one coverage row', async () => {
    const { page } = await setup('/admin/products/5/edit');

    page.addCoverage();
    page.removeCoverage(1);
    page.removeCoverage(0);

    expect(page.coverages.length).toBe(1);
  });

  it('reports range errors', async () => {
    const { page } = await setup('/admin/products/5/edit');
    page.form?.patchValue({ minimumTermMonths: 24, maximumTermMonths: 6 });

    page.onSubmit();

    expect(page.rangeError).toBe('Minimum policy term cannot exceed maximum policy term.');
  });

  it('dispatches updateProduct with the normalised request', async () => {
    const { page, store } = await setup('/admin/products/5/edit');
    page.form?.patchValue({ name: '  Rain Cover Plus  ' });

    page.onSubmit();

    expect(store.dispatch).toHaveBeenCalledWith(
      updateProduct({
        productId: 5,
        request: expect.objectContaining({
          productCode: 'WEATHER-001',
          name: 'Rain Cover Plus',
          thresholdValue: 150,
        }),
      }),
    );
  });

  it('shows toasts for update results', async () => {
    const { actions$, toast } = await setup('/admin/products/5/edit');

    actions$.next(updateProductSuccess({ product }));
    actions$.next(updateProductFailure({ error: 'Validation failed' }));

    expect(toast.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Rain Cover was updated successfully.' }));
    expect(toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: 'error', message: 'Validation failed' }));
  });
});
