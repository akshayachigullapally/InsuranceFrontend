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
  updateZoneAlert,
  updateZoneExposureCap,
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
  toggleAlert(zone: ZoneResponse): void;
  setExposureCap(zone: ZoneResponse): void;
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

    page.archive(zone);
    fixture.detectChanges();
    expect(store.dispatch).not.toHaveBeenCalledWith(archiveZone({ zoneId: 12 }));
    clickButton('Archive zone');
    expect(store.dispatch).toHaveBeenCalledWith(archiveZone({ zoneId: 12 }));
  });

  function dialog(): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('[role="dialog"]');
  }

  function clickButton(label: string): void {
    const button = Array.from(dialog()!.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === label,
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
  }

  it('raises a weather alert from an in-app dialog, never a browser popup', () => {
    const prompt = vi.spyOn(window, 'prompt');

    page.toggleAlert(zone);
    fixture.detectChanges();
    expect(dialog()!.textContent).toContain('Raise alert for Hyderabad Gachibowli Zone');

    const message = dialog()!.querySelector('#alertMessage') as HTMLTextAreaElement;
    message.value = '  Cyclone warning  ';
    message.dispatchEvent(new Event('input'));
    clickButton('Raise alert');

    expect(store.dispatch).toHaveBeenCalledWith(
      updateZoneAlert({ zoneId: 12, active: true, message: 'Cyclone warning' }),
    );
    expect(dialog()).toBeNull();
    expect(prompt).not.toHaveBeenCalled();
  });

  it('does not raise an alert with an empty message', () => {
    page.toggleAlert(zone);
    fixture.detectChanges();
    const message = dialog()!.querySelector('#alertMessage') as HTMLTextAreaElement;
    message.value = '';
    message.dispatchEvent(new Event('input'));
    clickButton('Raise alert');

    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: updateZoneAlert.type }));
    expect(dialog()!.textContent).toContain('Enter a message');
  });

  it('clears an alert after confirming in the dialog', () => {
    const confirm = vi.spyOn(window, 'confirm');

    page.toggleAlert({ ...zone, weatherAlert: true, alertMessage: 'Flood' });
    fixture.detectChanges();
    expect(dialog()!.textContent).toContain('Clear the weather alert for Hyderabad Gachibowli Zone?');
    clickButton('Clear alert');

    expect(store.dispatch).toHaveBeenCalledWith(updateZoneAlert({ zoneId: 12, active: false }));
    expect(confirm).not.toHaveBeenCalled();
  });

  it('sets and removes an exposure cap from the dialog', () => {
    page.setExposureCap(zone);
    fixture.detectChanges();
    const input = dialog()!.querySelector('#maxExposure') as HTMLInputElement;
    input.value = '50000000';
    input.dispatchEvent(new Event('input'));
    clickButton('Save cap');
    expect(store.dispatch).toHaveBeenCalledWith(updateZoneExposureCap({ zoneId: 12, maxExposure: 50000000 }));

    page.setExposureCap({ ...zone, maxExposure: 50000000 });
    fixture.detectChanges();
    clickButton('Remove cap');
    expect(store.dispatch).toHaveBeenCalledWith(updateZoneExposureCap({ zoneId: 12, maxExposure: null }));
  });

  it('rejects a cap of zero', () => {
    page.setExposureCap(zone);
    fixture.detectChanges();
    const input = dialog()!.querySelector('#maxExposure') as HTMLInputElement;
    input.value = '0';
    input.dispatchEvent(new Event('input'));
    clickButton('Save cap');

    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: updateZoneExposureCap.type }));
    expect(dialog()!.textContent).toContain('Enter an amount greater than zero.');
  });

  it('closes the form and clears selection on destroy', () => {
    page.openEdit(zone);
    page.closeForm();
    expect(page.editingZone).toBeNull();

    fixture.destroy();
    expect(store.dispatch).toHaveBeenCalledWith(clearSelectedZone());
  });
});
