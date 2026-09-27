import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { AdminZonesComponent } from './admin-zones.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import {
  archiveZone,
  clearSelectedZone,
  clearZoneFilters,
  clearZonesError,
  createZone,
  loadZones,
  setZonesSearch,
  updateZone,
  updateZoneStatus,
} from '../../state/zones/zones.actions';
import { ZoneResponse } from '../../dtos/zones/zone-response.dto';

type ZonesInternals = {
  applyStateFilter(event: Event): void;
  clearFilters(): void;
  openCreate(): void;
  openEdit(zone: ZoneResponse): void;
  closeForm(): void;
  submit(): void;
  changeStatus(zone: ZoneResponse, event: Event): void;
  archive(zone: ZoneResponse): void;
  selectedState: string | null;
  formOpen: boolean;
  editingZone: ZoneResponse | null;
};

describe('AdminZonesComponent', () => {
  let fixture: ComponentFixture<AdminZonesComponent>;
  let component: AdminZonesComponent;
  let page: ZonesInternals;
  let store: MockStore;
  const zone = {
    id: 12,
    zoneCode: 'HYD_GACHIBOWLI',
    zoneName: 'Hyderabad Gachibowli Zone',
    country: 'India',
    state: 'Telangana',
    district: 'Hyderabad',
    postalCode: '500032',
    latitude: 17.44,
    longitude: 78.35,
    radiusKm: 5,
    status: 'ACTIVE',
  } as ZoneResponse;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminZonesComponent],
      providers: pageTestProviders(),
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(AdminZonesComponent);
    component = fixture.componentInstance;
    page = component as unknown as ZonesInternals;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('loads zones on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(clearZonesError());
    expect(store.dispatch).toHaveBeenCalledWith(loadZones({}));
  });

  it('debounces the search box', () => {
    vi.useFakeTimers();

    component.searchControl.setValue('gachibowli');
    vi.advanceTimersByTime(250);

    expect(store.dispatch).toHaveBeenCalledWith(setZonesSearch({ search: 'gachibowli' }));
  });

  it('filters by state and clears filters', () => {
    page.applyStateFilter({ target: { value: ' Telangana ' } } as unknown as Event);
    expect(page.selectedState).toBe('Telangana');
    expect(store.dispatch).toHaveBeenCalledWith(loadZones({ state: 'Telangana' }));

    page.clearFilters();
    expect(page.selectedState).toBeNull();
    expect(store.dispatch).toHaveBeenCalledWith(clearZoneFilters());
  });

  it('rejects out-of-range coordinates', () => {
    component.form.patchValue({ latitude: 95, longitude: -181, radiusKm: 0 });

    expect(component.form.controls.latitude.hasError('max')).toBe(true);
    expect(component.form.controls.longitude.hasError('min')).toBe(true);
    expect(component.form.controls.radiusKm.hasError('min')).toBe(true);
  });

  it('creates a zone with trimmed values', () => {
    page.openCreate();
    expect(component.form.value.country).toBe('India');
    component.form.setValue({
      zoneCode: ' HYD_UPPAL ',
      zoneName: ' Hyderabad Uppal Zone ',
      country: 'India',
      state: 'Telangana',
      district: 'Hyderabad',
      postalCode: '  ',
      latitude: 17.4058,
      longitude: 78.5591,
      radiusKm: 5,
    });

    page.submit();

    expect(store.dispatch).toHaveBeenCalledWith(
      createZone({
        request: {
          zoneCode: 'HYD_UPPAL',
          zoneName: 'Hyderabad Uppal Zone',
          country: 'India',
          state: 'Telangana',
          district: 'Hyderabad',
          postalCode: undefined,
          latitude: 17.4058,
          longitude: 78.5591,
          radiusKm: 5,
        },
      }),
    );
    expect(page.formOpen).toBe(false);
  });

  it('updates an edited zone', () => {
    page.openEdit(zone);
    expect(component.form.value.zoneCode).toBe('HYD_GACHIBOWLI');

    page.submit();

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: updateZone.type, zoneId: 12 }),
    );
  });

  it('changes status only for a different value and archives on confirm', () => {
    page.changeStatus(zone, { target: { value: 'ACTIVE' } } as unknown as Event);
    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: updateZoneStatus.type }));

    page.changeStatus(zone, { target: { value: 'INACTIVE' } } as unknown as Event);
    expect(store.dispatch).toHaveBeenCalledWith(updateZoneStatus({ zoneId: 12, status: 'INACTIVE' as never }));

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    page.archive(zone);
    expect(store.dispatch).toHaveBeenCalledWith(archiveZone({ zoneId: 12 }));
  });

  it('closes the form and clears selection on destroy', () => {
    page.openEdit(zone);
    page.closeForm();
    expect(page.editingZone).toBeNull();

    fixture.destroy();
    expect(store.dispatch).toHaveBeenCalledWith(clearSelectedZone());
  });
});
