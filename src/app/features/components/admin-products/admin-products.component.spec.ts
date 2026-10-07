import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Subject } from 'rxjs';
import { AdminProductsComponent } from './admin-products.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import { ToastService } from '../../../shared/services/toast.service';
import {
  clearProductsError,
  loadAdminProducts,
  updateProductStatus,
} from '../../state/products/products.actions';
import { ProductResponse } from '../../dtos/products/product-response.dto';

type ProductsInternals = {
  onStatusChange(product: ProductResponse, event: Event): void;
  onDelete(productId: number): void;
  categoryLabel(category: string): string;
};

describe('AdminProductsComponent', () => {
  let page: ProductsInternals;
  let store: MockStore;
  let actions$: Subject<Action>;
  let toast: { show: ReturnType<typeof vi.fn> };
  const product = { id: 3, name: 'Rain Cover', status: 'ACTIVE' } as ProductResponse;

  beforeEach(async () => {
    actions$ = new Subject<Action>();
    toast = { show: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [AdminProductsComponent],
      providers: [
        ...pageTestProviders(),
        provideMockActions(() => actions$),
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    const fixture: ComponentFixture<AdminProductsComponent> = TestBed.createComponent(AdminProductsComponent);
    page = fixture.componentInstance as unknown as ProductsInternals;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads admin products on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(clearProductsError());
    expect(store.dispatch).toHaveBeenCalledWith(loadAdminProducts());
  });

  it('dispatches a status update only when the status changes', () => {
    page.onStatusChange(product, { target: { value: 'ACTIVE' } } as unknown as Event);
    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: updateProductStatus.type }));

    page.onStatusChange(product, { target: { value: 'INACTIVE' } } as unknown as Event);
    expect(store.dispatch).toHaveBeenCalledWith(updateProductStatus({ productId: 3, status: 'INACTIVE' }));
  });
});
