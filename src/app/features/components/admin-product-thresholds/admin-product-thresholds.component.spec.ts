import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { AdminProductThresholdsComponent } from './admin-product-thresholds.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { clearProductsError, loadAdminProducts } from '../../state/products/products.actions';
import { ProductResponse } from '../../dtos/products/product-response.dto';
import { TriggerCondition } from '../../dtos/triggers/trigger-condition.dto';

describe('AdminProductThresholdsComponent', () => {
  let fixture: ComponentFixture<AdminProductThresholdsComponent>;
  let store: MockStore;

  async function setup(error: string | null = null) {
    await TestBed.configureTestingModule({
      imports: [AdminProductThresholdsComponent],
      providers: pageTestProviders({ products: { ...mockRootState().products, error } }),
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(AdminProductThresholdsComponent);
    fixture.detectChanges();
  }

  it('clears errors and loads admin products on init', async () => {
    await setup();

    expect(store.dispatch).toHaveBeenCalledWith(clearProductsError());
    expect(store.dispatch).toHaveBeenCalledWith(loadAdminProducts());
  });

  it('maps a product to its trigger condition', async () => {
    await setup();
    const product = {
      perilCode: 'EXCESS_RAINFALL',
      measurementType: 'RAINFALL',
      measurementUnit: 'MM',
      thresholdValue: 150,
      comparisonOperator: 'GREATER_THAN_OR_EQUAL',
      aggregationType: 'SUM',
      observationWindowHours: 24,
      minimumObservationCount: 1,
      triggerDescription: 'Heavy rain',
      humanReadableTrigger: '150 mm in 24 h',
    } as unknown as ProductResponse;

    const condition = (fixture.componentInstance as unknown as {
      triggerCondition(p: ProductResponse): TriggerCondition;
    }).triggerCondition(product);

    expect(condition).toEqual({
      perilCode: 'EXCESS_RAINFALL',
      measurementType: 'RAINFALL',
      measurementUnit: 'MM',
      thresholdValue: 150,
      comparisonOperator: 'GREATER_THAN_OR_EQUAL',
      aggregationType: 'SUM',
      observationWindowHours: 24,
      minimumObservationCount: 1,
      triggerDescription: 'Heavy rain',
      humanReadableTrigger: '150 mm in 24 h',
    });
  });

  it('shows the error from the store', async () => {
    await setup('Could not load products');

    expect(fixture.nativeElement.textContent).toContain('Could not load products');
  });
});
