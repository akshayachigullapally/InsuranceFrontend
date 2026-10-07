import { TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { MockStore } from '@ngrx/store/testing';
import { Subject, firstValueFrom, of } from 'rxjs';
import { MeasurementStatusPanelComponent } from './measurement-status-panel.component';
import { loggedInAuth, pageTestProviders } from '../../../../testing/test-helpers';
import { ProductService } from '../../../features/services/product.service';
import { CurrentMeasurementService } from '../../../features/services/current-measurement.service';
import { ToastService } from '../../services/toast.service';
import { ProductResponse } from '../../../features/dtos/products/product-response.dto';

type PanelInternals = {
  onEdit(card: { measurementType: string; latestValue: number | null }): void;
  onCancelEdit(): void;
  onSave(card: unknown): void;
  isValidEdit(): boolean;
  lastUpdated(at: string | null): string;
  rowState(value: number | null, threshold: number | null, operator: string | null, triggered: boolean): { state: string; progress: number | null };
  themeFor(type: string): { tile: string };
  summarize(cards: unknown[]): { live: number; products: number; approaching: number; triggered: number };
  editingType: string | null;
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
  let productService: { getAdminMeasurementStatus: ReturnType<typeof vi.fn>; getMeasurementStatus: ReturnType<typeof vi.fn> };
  let measurementService: { setCurrentReading: ReturnType<typeof vi.fn> };
  let toast: { show: ReturnType<typeof vi.fn> };

  const rainfallCard = {
    measurementType: 'RAINFALL',
    unit: 'MM',
    latestValue: 180,
    rows: [{ productId: 1 }, { productId: 2 }],
  };

  beforeEach(async () => {
    productService = {
      getAdminMeasurementStatus: vi.fn().mockReturnValue(of(statusCards)),
      getMeasurementStatus: vi.fn().mockReturnValue(of([])),
    };
    measurementService = { setCurrentReading: vi.fn() };
    toast = { show: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [MeasurementStatusPanelComponent],
      providers: [
        ...pageTestProviders({ auth: loggedInAuth('ROLE_ADMIN') }),
        { provide: ProductService, useValue: productService },
        { provide: CurrentMeasurementService, useValue: measurementService },
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

  it('allows zero but not negative readings, except for temperature', () => {
    panel.onEdit(rainfallCard);
    panel.editingValue = 0;
    expect(panel.isValidEdit()).toBe(true);
    panel.editingValue = -2;
    expect(panel.isValidEdit()).toBe(false);

    panel.onEdit({ measurementType: 'TEMPERATURE', latestValue: 20 });
    panel.editingValue = -2;
    expect(panel.isValidEdit()).toBe(true);

    panel.onEdit({ measurementType: 'HUMIDITY', latestValue: 50 });
    panel.editingValue = 100;
    expect(panel.isValidEdit()).toBe(true);
    panel.editingValue = 101;
    expect(panel.isValidEdit()).toBe(false);
  });

  it('saves the new reading, shows a toast and refreshes', () => {
    const result = new Subject<unknown>();
    measurementService.setCurrentReading.mockReturnValue(result);
    panel.onEdit(rainfallCard);
    panel.editingValue = 160;

    panel.onSave(rainfallCard);

    expect(panel.saving).toBe(true);
    expect(measurementService.setCurrentReading).toHaveBeenCalledWith({
      measurementType: 'RAINFALL',
      value: 160,
      productIds: [1, 2],
    });
    expect(store.dispatch).not.toHaveBeenCalled();

    result.next({ value: 160, zoneCount: 2, holdMinutes: 60, triggeredProducts: [], claimsCreatedCount: 0 });
    expect(panel.saving).toBe(false);
    expect(panel.editingType).toBeNull();
    expect(toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        title: 'Rainfall updated',
        message: 'Now 160 mm in 2 zones for the next 60 min. No policy threshold was crossed.',
      }),
    );
  });

  it('reports the trigger and claims when the reading crosses a threshold', () => {
    measurementService.setCurrentReading.mockReturnValue(
      of({ value: 160, zoneCount: 1, holdMinutes: 60, triggeredProducts: ['WEATHER-001'], claimsCreatedCount: 2, unpaidPolicyCount: 1 }),
    );
    panel.onEdit(rainfallCard);
    panel.onSave(rainfallCard);

    expect(toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'warning',
        title: 'Trigger fired: WEATHER-001',
        message: 'Now 160 mm in 1 zone for the next 60 min. 2 automatic claims created, 1 unpaid policy skipped.',
      }),
    );
  });

  it('measures progress towards the trigger and flags values near it', () => {
    expect(panel.rowState(75, 150, 'GREATER_THAN_OR_EQUAL', false)).toEqual({ state: 'NORMAL', progress: 50 });
    expect(panel.rowState(135, 150, 'GREATER_THAN_OR_EQUAL', false)).toEqual({ state: 'APPROACHING', progress: 90 });
    expect(panel.rowState(180, 150, 'GREATER_THAN_OR_EQUAL', true)).toEqual({ state: 'THRESHOLD_EXCEEDED', progress: 100 });
    expect(panel.rowState(null, 150, 'GREATER_THAN_OR_EQUAL', false)).toEqual({ state: 'NO_DATA', progress: null });
  });
});
