import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { PublicProductListComponent } from './public-product-list.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import {
  clearProductsError,
  loadProducts,
  loadProductsByCategory,
} from '../../state/products/products.actions';
import { ProductCategory } from '../../dtos/products/product-response.dto';

type ListInternals = {
  applyCategory(category: ProductCategory | null): void;
  categoryLabel(category: string): string;
  selectedCategory: ProductCategory | null;
};

describe('PublicProductListComponent', () => {
  let fixture: ComponentFixture<PublicProductListComponent>;
  let list: ListInternals;
  let store: MockStore;

  async function setup(stateOverrides: Record<string, unknown> = {}) {
    await TestBed.configureTestingModule({
      imports: [PublicProductListComponent],
      providers: pageTestProviders(stateOverrides),
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(PublicProductListComponent);
    list = fixture.componentInstance as unknown as ListInternals;
    fixture.detectChanges();
  }

  it('clears errors and loads products on init', async () => {
    await setup();

    expect(store.dispatch).toHaveBeenCalledWith(clearProductsError());
    expect(store.dispatch).toHaveBeenCalledWith(loadProducts());
  });

  it('loads products by category when a category is chosen', async () => {
    await setup();

    list.applyCategory('FLOOD');

    expect(list.selectedCategory).toBe('FLOOD');
    expect(store.dispatch).toHaveBeenCalledWith(loadProductsByCategory({ category: 'FLOOD' }));
  });
});
