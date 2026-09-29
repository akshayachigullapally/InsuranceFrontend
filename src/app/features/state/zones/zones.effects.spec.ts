import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { ZonesEffects } from './zones.effects';
import * as ZonesActions from './zones.actions';
import { ZoneService } from '../../services/zone.service';
import { ZoneResponse } from '../../dtos/zones/zone-response.dto';

function collect(effect$: Observable<unknown>): unknown[] {
  const results: unknown[] = [];
  effect$.subscribe((action) => results.push(action));
  return results;
}

describe('ZonesEffects', () => {
  let actions$: Observable<Action>;
  let effects: ZonesEffects;
  let zoneService: Record<string, ReturnType<typeof vi.fn>>;
  const zone = { id: 1, zoneName: 'Hyderabad Central Zone' } as ZoneResponse;

  beforeEach(() => {
    zoneService = {
      getAllZones: vi.fn(),
      createZone: vi.fn(),
      updateZoneStatus: vi.fn(),
      updateZoneAlert: vi.fn(),
      updateZoneExposureCap: vi.fn(),
      archiveZone: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ZonesEffects,
        provideMockActions(() => actions$),
        { provide: ZoneService, useValue: zoneService },
      ],
    });
    effects = TestBed.inject(ZonesEffects);
  });

  it('loads zones with the state filter', () => {
    zoneService['getAllZones'].mockReturnValue(of([zone]));
    actions$ = of(ZonesActions.loadZones({ state: 'Telangana' }));

    expect(collect(effects.loadZones$)).toEqual([ZonesActions.loadZonesSuccess({ zones: [zone] })]);
    expect(zoneService['getAllZones']).toHaveBeenCalledWith('Telangana');
  });

  it('maps load errors to a failure', () => {
    zoneService['getAllZones'].mockReturnValue(throwError(() => ({ error: { message: 'Service down' } })));
    actions$ = of(ZonesActions.loadZones({}));

    expect(collect(effects.loadZones$)).toEqual([ZonesActions.loadZonesFailure({ error: 'Service down' })]);
  });

  it('raises a weather alert and returns the updated zone', () => {
    const alerted = { ...zone, weatherAlert: true, alertMessage: 'Cyclone' } as ZoneResponse;
    zoneService['updateZoneAlert'].mockReturnValue(of(alerted));
    actions$ = of(ZonesActions.updateZoneAlert({ zoneId: 1, active: true, message: 'Cyclone' }));

    expect(collect(effects.updateZoneAlert$)).toEqual([ZonesActions.updateZoneStatusSuccess({ zone: alerted })]);
    expect(zoneService['updateZoneAlert']).toHaveBeenCalledWith(1, true, 'Cyclone');
  });

  it('sets an exposure cap and maps errors to a failure', () => {
    zoneService['updateZoneExposureCap'].mockReturnValue(
      throwError(() => ({ error: { message: 'Exposure cap must be greater than zero' } })),
    );
    actions$ = of(ZonesActions.updateZoneExposureCap({ zoneId: 1, maxExposure: 0 }));

    expect(collect(effects.updateZoneExposureCap$)).toEqual([
      ZonesActions.updateZoneStatusFailure({ error: 'Exposure cap must be greater than zero' }),
    ]);
  });

  it('creates a zone', () => {
    zoneService['createZone'].mockReturnValue(of(zone));
    actions$ = of(ZonesActions.createZone({ request: {} as never }));

    expect(collect(effects.createZone$)).toEqual([ZonesActions.createZoneSuccess({ zone })]);
  });

  it('updates a zone status', () => {
    zoneService['updateZoneStatus'].mockReturnValue(of(zone));
    actions$ = of(ZonesActions.updateZoneStatus({ zoneId: 1, status: 'INACTIVE' as never }));

    expect(collect(effects.updateZoneStatus$)).toEqual([ZonesActions.updateZoneStatusSuccess({ zone })]);
    expect(zoneService['updateZoneStatus']).toHaveBeenCalledWith(1, 'INACTIVE');
  });

  it('emits the archived zone id', () => {
    zoneService['archiveZone'].mockReturnValue(of({ message: 'Archived' }));
    actions$ = of(ZonesActions.archiveZone({ zoneId: 1 }));

    expect(collect(effects.archiveZone$)).toEqual([ZonesActions.archiveZoneSuccess({ zoneId: 1 })]);
  });
});
