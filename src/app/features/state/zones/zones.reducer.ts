import { Action, createReducer, on } from '@ngrx/store';
import { ZoneResponse } from '../../dtos/zones/zone-response.dto';
import {
  archiveZone,
  archiveZoneFailure,
  archiveZoneSuccess,
  clearSelectedZone,
  clearZoneFilters,
  clearZonesError,
  createZone,
  createZoneFailure,
  createZoneSuccess,
  loadZone,
  loadZoneFailure,
  loadZoneSuccess,
  loadZones,
  loadZonesFailure,
  loadZonesSuccess,
  setZonesSearch,
  updateZone,
  updateZoneFailure,
  updateZoneAlert,
  updateZoneExposureCap,
  updateZoneStatus,
  updateZoneStatusFailure,
  updateZoneStatusSuccess,
  updateZoneSuccess,
} from './zones.actions';
import { initialZonesState, ZonesState } from './zones.state';

function upsert(zones: ZoneResponse[], zone: ZoneResponse): ZoneResponse[] {
  return zones.some(item => item.id === zone.id)
    ? zones.map(item => item.id === zone.id ? zone : item)
    : [zone, ...zones];
}

function matchesState(zone: ZoneResponse, state: string | null): boolean {
  return !state || zone.state.toLowerCase() === state.toLowerCase();
}

export const zonesReducer = createReducer(
  initialZonesState,

  on(loadZones, (state, { state: selectedState }): ZonesState => ({
    ...state,
    selectedState: selectedState?.trim() || null,
    isLoading: true,
    error: null,
  })),

  on(loadZonesSuccess, (state, { zones }): ZonesState => ({
    ...state,
    zones,
    isLoading: false,
  })),

  on(loadZonesFailure, (state, { error }): ZonesState => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(loadZone, (state): ZonesState => ({
    ...state,
    selectedZone: null,
    isLoading: true,
    error: null,
  })),

  on(loadZoneSuccess, (state, { zone }): ZonesState => ({
    ...state,
    selectedZone: zone,
    zones: state.zones.length ? upsert(state.zones, zone) : state.zones,
    isLoading: false,
  })),

  on(loadZoneFailure, (state, { error }): ZonesState => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(
    createZone,
    (state): ZonesState => ({
      ...state,
      isSaving: true,
      updatingZoneId: null,
      error: null,
    }),
  ),

  on(
    updateZone,
    updateZoneStatus,
    updateZoneAlert,
    updateZoneExposureCap,
    (state, { zoneId }): ZonesState => ({
      ...state,
      isSaving: true,
      updatingZoneId: zoneId,
      error: null,
    }),
  ),

  on(
    archiveZone,
    (state, { zoneId }): ZonesState => ({
      ...state,
      isSaving: true,
      updatingZoneId: zoneId,
      error: null,
    }),
  ),

  on(createZoneSuccess, (state, { zone }): ZonesState => ({
    ...state,
    zones: matchesState(zone, state.selectedState)
      ? upsert(state.zones, zone)
      : state.zones,
    selectedZone: zone,
    isSaving: false,
    updatingZoneId: null,
  })),

  on(
    updateZoneSuccess,
    updateZoneStatusSuccess,
    (state, { zone }): ZonesState => ({
      ...state,
      zones: matchesState(zone, state.selectedState)
        ? upsert(state.zones, zone)
        : state.zones.filter(item => item.id !== zone.id),
      selectedZone:
        state.selectedZone?.id === zone.id ? zone : state.selectedZone,
      isSaving: false,
      updatingZoneId: null,
    }),
  ),

  on(archiveZoneSuccess, (state, { zoneId }): ZonesState => ({
    ...state,
    zones: state.zones.filter(zone => zone.id !== zoneId),
    selectedZone:
      state.selectedZone?.id === zoneId ? null : state.selectedZone,
    isSaving: false,
    updatingZoneId: null,
  })),

  on(
    createZoneFailure,
    updateZoneFailure,
    updateZoneStatusFailure,
    archiveZoneFailure,
    (state, { error }): ZonesState => ({
      ...state,
      isSaving: false,
      updatingZoneId: null,
      error,
    }),
  ),

  on(setZonesSearch, (state, { search }): ZonesState => ({
    ...state,
    search,
  })),

  on(clearZoneFilters, (state): ZonesState => ({
    ...state,
    selectedState: null,
    search: '',
  })),

  on(clearSelectedZone, (state): ZonesState => ({
    ...state,
    selectedZone: null,
  })),

  on(clearZonesError, (state): ZonesState => ({
    ...state,
    error: null,
  })),
);

export function reducer(
  state: ZonesState | undefined,
  action: Action,
): ZonesState {
  return zonesReducer(state, action);
}