import { zonesReducer } from './zones.reducer';
import { initialZonesState, ZonesState } from './zones.state';
import * as ZonesActions from './zones.actions';
import { ZoneResponse } from '../../dtos/zones/zone-response.dto';

function makeZone(id: number, state = 'Telangana', status: ZoneResponse['status'] = 'ACTIVE'): ZoneResponse {
  return { id, zoneCode: `Z${id}`, zoneName: `Zone ${id}`, state, status } as ZoneResponse;
}

describe('zonesReducer', () => {
  it('returns the initial state for an unknown action', () => {
    expect(zonesReducer(undefined, { type: '[Unknown]' } as never)).toEqual(initialZonesState);
  });

  it('remembers a trimmed state filter while loading', () => {
    const state = zonesReducer(initialZonesState, ZonesActions.loadZones({ state: '  Telangana ' }));

    expect(state.selectedState).toBe('Telangana');
    expect(state.isLoading).toBe(true);
  });

  it('treats a blank state filter as no filter', () => {
    expect(zonesReducer(initialZonesState, ZonesActions.loadZones({ state: '  ' })).selectedState).toBeNull();
  });

  it('stores loaded zones', () => {
    const zones = [makeZone(1), makeZone(2)];

    const state = zonesReducer(initialZonesState, ZonesActions.loadZonesSuccess({ zones }));

    expect(state.zones).toEqual(zones);
    expect(state.isLoading).toBe(false);
  });

  it('tracks which zone is being updated', () => {
    const state = zonesReducer(initialZonesState, ZonesActions.updateZoneStatus({ zoneId: 4, status: 'INACTIVE' as never }));

    expect(state.updatingZoneId).toBe(4);
    expect(state.isSaving).toBe(true);
  });

  it('adds a created zone only when it matches the state filter', () => {
    const filtered: ZonesState = { ...initialZonesState, selectedState: 'Karnataka' };

    const skipped = zonesReducer(filtered, ZonesActions.createZoneSuccess({ zone: makeZone(5, 'Telangana') }));
    expect(skipped.zones).toEqual([]);

    const added = zonesReducer(filtered, ZonesActions.createZoneSuccess({ zone: makeZone(6, 'karnataka') }));
    expect(added.zones.map((zone) => zone.id)).toEqual([6]);
  });

  it('replaces an updated zone and clears the updating id', () => {
    const current: ZonesState = { ...initialZonesState, zones: [makeZone(1)], updatingZoneId: 1, isSaving: true };

    const state = zonesReducer(
      current,
      ZonesActions.updateZoneStatusSuccess({ zone: makeZone(1, 'Telangana', 'INACTIVE') }),
    );

    expect(state.zones[0].status).toBe('INACTIVE');
    expect(state.updatingZoneId).toBeNull();
    expect(state.isSaving).toBe(false);
  });

  it('removes an archived zone and its selection', () => {
    const current: ZonesState = { ...initialZonesState, zones: [makeZone(1), makeZone(2)], selectedZone: makeZone(1) };

    const state = zonesReducer(current, ZonesActions.archiveZoneSuccess({ zoneId: 1 }));

    expect(state.zones.map((zone) => zone.id)).toEqual([2]);
    expect(state.selectedZone).toBeNull();
  });

  it('stores save failures', () => {
    const state = zonesReducer(
      { ...initialZonesState, isSaving: true, updatingZoneId: 3 },
      ZonesActions.archiveZoneFailure({ error: 'Zone in use' }),
    );

    expect(state.error).toBe('Zone in use');
    expect(state.updatingZoneId).toBeNull();
  });

  it('sets and clears the search filters', () => {
    const searched = zonesReducer(initialZonesState, ZonesActions.setZonesSearch({ search: 'hyd' }));
    expect(searched.search).toBe('hyd');

    const cleared = zonesReducer({ ...searched, selectedState: 'Telangana' }, ZonesActions.clearZoneFilters());
    expect(cleared.search).toBe('');
    expect(cleared.selectedState).toBeNull();
  });
});
