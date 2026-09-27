import { TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Subject } from 'rxjs';
import { AdminProductsComponent } from './admin-products.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { ToastService } from '../../../shared/services/toast.service';
import { updateProductStatus } from '../../state/products/products.actions';
import { ProductResponse } from '../../dtos/products/product-response.dto';

/** Regression: the status dropdown must show each product's real status. */
describe('AdminProductsComponent status dropdown', () => {
  const products = [
    { id: 1, name: 'Rain Cover', productCode: 'RAIN', category: 'WEATHER', status: 'ACTIVE', coverages: [] },
    { id: 2, name: 'Flood Cover', productCode: 'FLOOD', category: 'FLOOD', status: 'INACTIVE', coverages: [] },
    { id: 3, name: 'Old Cover', productCode: 'OLD', category: 'OTHER', status: 'ARCHIVED', coverages: [] },
  ] as unknown as ProductResponse[];

  async function render() {
    await TestBed.configureTestingModule({
      imports: [AdminProductsComponent],
      providers: [
        ...pageTestProviders({
          products: { ...mockRootState().products, adminProducts: products, isLoading: false },
        }),
        provideMockActions(() => new Subject()),
        { provide: ToastService, useValue: { show: vi.fn() } },
      ],
    }).compileComponents();
    const store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(AdminProductsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const selects = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLSelectElement>('select[aria-label="Change product status"]'),
    );
    return { store, selects };
  }

  it('shows the saved status of every product', async () => {
    const { selects } = await render();

    expect(selects.map(select => select.value)).toEqual(['ACTIVE', 'INACTIVE', 'ARCHIVED']);
  });

  it('dispatches the change but keeps showing the saved status until it is confirmed', async () => {
    const { store, selects } = await render();

    selects[0].value = 'DRAFT';
    selects[0].dispatchEvent(new Event('change'));

    expect(store.dispatch).toHaveBeenCalledWith(updateProductStatus({ productId: 1, status: 'DRAFT' }));
    expect(selects[0].value).toBe('ACTIVE');
  });
});
