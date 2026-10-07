import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormGroup } from '@angular/forms';
import { Action } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Subject } from 'rxjs';
import { AdminProductNewComponent } from './admin-product-new.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import { ToastService } from '../../../shared/services/toast.service';
import {
  clearProductsError,
  createProduct,
  createProductFailure,
  createProductSuccess,
} from '../../state/products/products.actions';
import { ProductResponse } from '../../dtos/products/product-response.dto';

type NewProductInternals = {
  coverages: FormArray;
  trigger: FormGroup;
  rangeError: string | null;
  addCoverage(): void;
  removeCoverage(index: number): void;
  onSubmit(): void;
  triggerConfigured(): boolean;
};

describe('AdminProductNewComponent', () => {
  let component: AdminProductNewComponent;
  let page: NewProductInternals;
  let store: MockStore;
  let actions$: Subject<Action>;
  let toast: { show: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    actions$ = new Subject<Action>();
    toast = { show: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [AdminProductNewComponent],
      providers: [
        ...pageTestProviders(),
        provideMockActions(() => actions$),
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    const fixture: ComponentFixture<AdminProductNewComponent> = TestBed.createComponent(AdminProductNewComponent);
    component = fixture.componentInstance;
    page = component as unknown as NewProductInternals;
    fixture.detectChanges();
  });

  function fillValidProduct(): void {
    component.form.patchValue({ productCode: ' weather-009 ', name: ' Hail Cover ' });
    page.coverages.at(0).patchValue({ coverageCode: ' crop ', name: ' Crop loss ', coverageLimit: 50000 });
  }

  it('clears errors on init and starts with one coverage row', () => {
    expect(store.dispatch).toHaveBeenCalledWith(clearProductsError());
    expect(page.coverages.length).toBe(1);
    expect(page.triggerConfigured()).toBe(true);
  });

  it('drops trigger validation when the trigger is disabled', () => {
    page.trigger.patchValue({ thresholdValue: null });
    expect(page.trigger.get('thresholdValue')?.valid).toBe(false);

    page.trigger.get('triggerEnabled')?.setValue(false);

    expect(page.trigger.get('thresholdValue')?.valid).toBe(true);
  });

  it('dispatches createProduct with a normalised request', () => {
    fillValidProduct();

    page.onSubmit();

    expect(store.dispatch).toHaveBeenCalledWith(
      createProduct({
        request: expect.objectContaining({
          productCode: 'WEATHER-009',
          name: 'Hail Cover',
          category: 'WEATHER',
          perilCode: 'RAINFALL-LOW',
          thresholdValue: 40,
          coverages: [
            {
              coverageCode: 'CROP',
              name: 'Crop loss',
              description: undefined,
              coverageLimit: 50000,
              mandatory: false,
              active: true,
            },
          ],
        }),
      }),
    );
  });

  it('shows toasts for create success and failure', () => {
    actions$.next(createProductSuccess({ product: { name: 'Hail Cover' } as ProductResponse }));
    actions$.next(createProductFailure({ error: 'Code already exists' }));

    expect(toast.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Hail Cover was created successfully.' }));
    expect(toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: 'error', message: 'Code already exists' }));
  });
});
