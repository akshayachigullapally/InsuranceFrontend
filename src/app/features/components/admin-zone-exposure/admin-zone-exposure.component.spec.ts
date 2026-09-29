import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminZoneExposureComponent } from './admin-zone-exposure.component';
import { ZoneService } from '../../services/zone.service';
import { ZoneExposureResponse } from '../../dtos/zones/zone-response.dto';

const zones: ZoneExposureResponse[] = [
  {
    zoneId: 1,
    zoneCode: 'HYDERABAD_CENTRAL',
    zoneName: 'Hyderabad Central Zone',
    weatherAlert: false,
    maxExposure: 500000,
    activeExposure: 300000,
    pendingExposure: 150000,
    usedExposure: 450000,
    remainingExposure: 50000,
    utilizationPercent: 90,
    activePolicyCount: 3,
    pendingPolicyCount: 1,
    salesOpen: true,
  },
  {
    zoneId: 2,
    zoneCode: 'MUMBAI_CENTRAL',
    zoneName: 'Mumbai Central Zone',
    weatherAlert: true,
    alertMessage: 'Cyclone warning',
    maxExposure: null,
    activeExposure: 100000,
    pendingExposure: 0,
    usedExposure: 100000,
    remainingExposure: null,
    utilizationPercent: null,
    activePolicyCount: 1,
    pendingPolicyCount: 0,
    salesOpen: false,
  },
];

async function render(response: ReturnType<ZoneService['getZoneExposure']>) {
  await TestBed.configureTestingModule({
    imports: [AdminZoneExposureComponent],
    providers: [provideRouter([]), { provide: ZoneService, useValue: { getZoneExposure: () => response } }],
  }).compileComponents();
  const fixture = TestBed.createComponent(AdminZoneExposureComponent);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('AdminZoneExposureComponent', () => {
  it('shows each zone with its usage, bar and sales state', async () => {
    const element = await render(of(zones));
    const rows = element.querySelectorAll('tbody tr');

    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('90.0% used');
    expect(rows[0].textContent).toContain('Open');
    expect(rows[0].querySelector('[role="progressbar"] div')!.className).toContain('bg-amber-500');
    expect(rows[1].textContent).toContain('No cap set');
    expect(rows[1].textContent).toContain('Paused – weather alert');
    expect(rows[1].textContent).toContain('Cyclone warning');
  });

  it('summarises total cover, alerts and closed zones', async () => {
    const element = await render(of(zones));

    expect(element.textContent).toContain('550,000');
    expect(element.textContent).toContain('Zones under weather alert');
  });

  it('shows the error when the report cannot be loaded', async () => {
    const element = await render(throwError(() => ({ error: { message: 'Trigger service is currently unavailable' } })));

    expect(element.textContent).toContain('Trigger service is currently unavailable');
  });
});
