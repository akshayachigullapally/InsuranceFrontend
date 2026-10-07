import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { AdminProductThresholdsComponent } from './admin-product-thresholds.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { clearProductsError, loadAdminProducts } from '../../state/products/products.actions';

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
});
