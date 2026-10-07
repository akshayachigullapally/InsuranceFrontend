import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminCurrentMeasurementsComponent } from './admin-current-measurements.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import { ProductService } from '../../services/product.service';
import { ZoneService } from '../../services/zone.service';
import { CurrentMeasurementService } from '../../services/current-measurement.service';
import { ProductResponse } from '../../dtos/products/product-response.dto';

const rainProduct = {
  id: 1,
  name: 'Rain Cover',
  status: 'ACTIVE',
  measurementType: 'RAINFALL',
  measurementUnit: 'MM',
  thresholdValue: 150,
  comparisonOperator: 'GREATER_THAN',
} as ProductResponse;

const products = [rainProduct, { id: 2, name: 'Old Cover', status: 'INACTIVE' } as ProductResponse];

describe('AdminCurrentMeasurementsComponent', () => {
  let component: AdminCurrentMeasurementsComponent;
  let measurementService: { getCurrentMeasurements: ReturnType<typeof vi.fn>; process: ReturnType<typeof vi.fn> };

  async function setup(productsResponse = of(products) as ReturnType<ProductService['getAdminProducts']>) {
    measurementService = {
      getCurrentMeasurements: vi.fn().mockReturnValue(
        of([{ productId: 1, locationZoneId: 4, currentValue: 120, measurementType: 'RAINFALL', measurementUnit: 'MM' }]),
      ),
      process: vi.fn().mockReturnValue(of({ measurementType: 'RAINFALL', measurementUnit: 'MM' })),
    };
    await TestBed.configureTestingModule({
      imports: [AdminCurrentMeasurementsComponent],
      providers: [
        ...pageTestProviders(),
        { provide: ProductService, useValue: { getAdminProducts: () => productsResponse } },
        { provide: ZoneService, useValue: { getActiveZones: () => of([{ id: 4, zoneName: 'Chennai East Zone' }]) } },
        { provide: CurrentMeasurementService, useValue: measurementService },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<AdminCurrentMeasurementsComponent> =
      TestBed.createComponent(AdminCurrentMeasurementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('keeps only active products and prefills forms from snapshots', async () => {
    await setup();

    expect(component.loading).toBe(false);
    expect(component.products.map((product) => product.id)).toEqual([1]);
    expect(component.form(1).getRawValue()).toEqual({ zoneId: 4, currentValue: 120 });
  });

  it('submits a measurement and stores the result', async () => {
    await setup();
    component.form(1).setValue({ zoneId: 4, currentValue: 175 });

    component.process(rainProduct);

    expect(measurementService.process).toHaveBeenCalledWith(
      expect.objectContaining({ productId: 1, locationZoneId: 4, currentValue: 175 }),
    );
    expect(component.results.has(1)).toBe(true);
    expect(component.currentSnapshot(rainProduct)?.currentValue).toBe(175);
    expect(component.processing.has(1)).toBe(false);
  });
});
