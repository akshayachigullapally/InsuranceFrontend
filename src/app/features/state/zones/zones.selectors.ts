import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ZonesState } from './zones.state';

const selectZonesState = createFeatureSelector<ZonesState>('zones');

export const selectZones = createSelector(selectZonesState, (state) => state.zones);

const selectZonesSearch = createSelector(selectZonesState, (state) => state.search);

export const selectZonesLoading = createSelector(selectZonesState, (state) => state.isLoading);

export const selectZonesSaving = createSelector(selectZonesState, (state) => state.isSaving);

export const selectUpdatingZoneId = createSelector(
  selectZonesState,
  (state) => state.updatingZoneId,
);

export const selectZonesError = createSelector(selectZonesState, (state) => state.error);

export const selectFilteredZones = createSelector(
  selectZones,
  selectZonesSearch,
  (zones, search) => {
    const value = search.trim().toLowerCase();

    if (!value) return zones;

    return zones.filter(
      (zone) =>
        zone.zoneCode.toLowerCase().includes(value) ||
        zone.zoneName.toLowerCase().includes(value) ||
        zone.country.toLowerCase().includes(value) ||
        zone.state.toLowerCase().includes(value) ||
        zone.district.toLowerCase().includes(value) ||
        zone.postalCode?.toLowerCase().includes(value) === true,
    );
  },
);

export const selectActiveZoneCount = createSelector(
  selectZones,
  (zones) => zones.filter((zone) => zone.status === 'ACTIVE').length,
);

export const selectInactiveZoneCount = createSelector(
  selectZones,
  (zones) => zones.filter((zone) => zone.status === 'INACTIVE').length,
);

export const selectDistinctStates = createSelector(selectZones, (zones) =>
  [...new Set(zones.map((zone) => zone.state))].sort((first, second) =>
    first.localeCompare(second),
  ),
);
