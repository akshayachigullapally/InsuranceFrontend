import { TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { Action } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Subject, firstValueFrom, of } from 'rxjs';
import { MeasurementStatusPanelComponent } from './measurement-status-panel.component';
import { loggedInAuth, pageTestProviders } from '../../../../testing/test-helpers';
import { ProductService } from '../../../features/services/product.service';
import { ToastService } from '../../services/toast.service';
import {
  updateProductThreshold,
  updateProductThresholdFailure,
  updateProductThresholdSuccess,
} from '../../../features/state/products/products.actions';
import { ProductResponse } from '../../../features/dtos/products/product-response.dto';

type PanelInternals = {
  onEdit(row: { productId: number; threshold: number | null }): void;
  onCancelEdit(): void;
  onSave(card: unknown): void;
  isValidEdit(): boolean;
  lastUpdated(at: string | null): string;
  editingProductId: number | null;
  editingValue: number | null;
  saving: boolean;
};

const statusCards = [
  {
    measurementType: 'RAINFALL',
    measurementUnit: 'MM',
    currentValue: 180,
    observedAt: '2026-09-27T10:00:00Z',
    products: [
      { productId: 1, productCode: 'WEATHER-001', productName: 'Rain Cover', thresholdValue: 150, comparisonOperator: 'GREATER_THAN_OR_EQUAL', triggered: true },
    ],
  },
  {
    measurementType: 'RIVER_LEVEL',
    measurementUnit: 'METER',
    currentValue: null,
    products: [],
  },
];

describe('MeasurementStatusPanelComponent', () => {
  let component: MeasurementStatusPanelComponent;
  let panel: PanelInternals;
  let store: MockStore;
  let actions$: Subject<Action>;
  let productService: { getAdminMeasurementStatus: ReturnType<typeof vi.fn>; getMeasurementStatus: ReturnType<typeof vi.fn> };
  let toast: { show: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    actions$ = new Subject<Action>();
    productService = {
      getAdminMeasurementStatus: vi.fn().mockReturnValue(of(statusCards)),
      getMeasurementStatus: vi.fn().mockReturnValue(of([])),
    };
    toast = { show: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [MeasurementStatusPanelComponent],
      providers: [
        ...pageTestProviders({ auth: loggedInAuth('ROLE_ADMIN') }),
        provideMockActions(() => actions$),
        { provide: ProductService, useValue: productService },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(MeasurementStatusPanelComponent);
    component = fixture.componentInstance;
    panel = component as unknown as PanelInternals;
    component.products = [{ id: 1, measurementType: 'RAINFALL' } as ProductResponse];
    component.ngOnChanges({ products: new SimpleChange(null, component.products, true) });
    component.ngOnInit();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('builds cards sorted by measurement type from the admin status endpoint', async () => {
    const cards = await firstValueFrom(component.cards$);

    expect(productService.getAdminMeasurementStatus).toHaveBeenCalled();
    expect(cards.map((card) => card.measurementType)).toEqual(['RAINFALL', 'RIVER_LEVEL']);
    expect(cards[0].state).toBe('THRESHOLD_EXCEEDED');
    expect(cards[0].rows[0].state).toBe('THRESHOLD_EXCEEDED');
    expect(cards[1].state).toBe('NO_DATA');
  });

  it('validates the edited threshold value', () => {
    panel.onEdit({ productId: 1, threshold: 150 });
    expect(panel.isValidEdit()).toBe(true);

    panel.editingValue = 0;
    expect(panel.isValidEdit()).toBe(false);

    panel.onCancelEdit();
    expect(panel.editingProductId).toBeNull();
  });

  it('dispatches a threshold update when saving a valid edit', () => {
    panel.onEdit({ productId: 1, threshold: 175 });

    panel.onSave({});

    expect(panel.saving).toBe(true);
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: updateProductThreshold.type, productId: 1 }),
    );
  });

  it('does not save an invalid value', () => {
    panel.onEdit({ productId: 1, threshold: -5 });

    panel.onSave({});

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('shows a success toast and resets editing on update success', () => {
    panel.onEdit({ productId: 1, threshold: 175 });
    panel.onSave({});

    actions$.next(
      updateProductThresholdSuccess({
        result: { productId: 1, triggeredPolicyCount: 2, createdClaimCount: 1 } as never,
      }),
    );

    expect(panel.saving).toBe(false);
    expect(panel.editingProductId).toBeNull();
    expect(toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success', message: '2 policies triggered. 1 claim created.' }),
    );
  });

  it('shows an error toast on update failure', () => {
    actions$.next(updateProductThresholdFailure({ error: 'Invalid threshold' }));

    expect(toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error', message: 'Invalid threshold' }),
    );
  });

  it('formats how long ago a value was observed', () => {
    const now = Date.now();

    expect(panel.lastUpdated(null)).toBe('');
    expect(panel.lastUpdated(new Date(now - 10_000).toISOString())).toBe('just now');
    expect(panel.lastUpdated(new Date(now - 5 * 60_000).toISOString())).toBe('5 min ago');
    expect(panel.lastUpdated(new Date(now - 3 * 3_600_000).toISOString())).toBe('3 h ago');
  });
});
