import { createAction, props } from '@ngrx/store';
import {
  ZoneManageableStatus,
  ZoneRequest,
  ZoneResponse,
} from '../../dtos/zones/zone-response.dto';

export const loadZones = createAction(
  '[Zones] Load Zones',
  props<{ state?: string }>(),
);

export const loadZonesSuccess = createAction(
  '[Zones] Load Zones Success',
  props<{ zones: ZoneResponse[] }>(),
);

export const loadZonesFailure = createAction(
  '[Zones] Load Zones Failure',
  props<{ error: string }>(),
);

export const loadZone = createAction(
  '[Zones] Load Zone',
  props<{ zoneId: number }>(),
);

export const loadZoneSuccess = createAction(
  '[Zones] Load Zone Success',
  props<{ zone: ZoneResponse }>(),
);

export const loadZoneFailure = createAction(
  '[Zones] Load Zone Failure',
  props<{ error: string }>(),
);

export const createZone = createAction(
  '[Zones] Create Zone',
  props<{ request: ZoneRequest }>(),
);

export const createZoneSuccess = createAction(
  '[Zones] Create Zone Success',
  props<{ zone: ZoneResponse }>(),
);

export const createZoneFailure = createAction(
  '[Zones] Create Zone Failure',
  props<{ error: string }>(),
);

export const updateZone = createAction(
  '[Zones] Update Zone',
  props<{ zoneId: number; request: ZoneRequest }>(),
);

export const updateZoneSuccess = createAction(
  '[Zones] Update Zone Success',
  props<{ zone: ZoneResponse }>(),
);

export const updateZoneFailure = createAction(
  '[Zones] Update Zone Failure',
  props<{ error: string }>(),
);

export const updateZoneStatus = createAction(
  '[Zones] Update Zone Status',
  props<{ zoneId: number; status: ZoneManageableStatus }>(),
);

export const updateZoneStatusSuccess = createAction(
  '[Zones] Update Zone Status Success',
  props<{ zone: ZoneResponse }>(),
);

export const updateZoneStatusFailure = createAction(
  '[Zones] Update Zone Status Failure',
  props<{ error: string }>(),
);

export const updateZoneAlert = createAction(
  '[Zones] Update Zone Alert',
  props<{ zoneId: number; active: boolean; message?: string }>(),
);

export const updateZoneExposureCap = createAction(
  '[Zones] Update Zone Exposure Cap',
  props<{ zoneId: number; maxExposure: number | null }>(),
);

export const archiveZone = createAction(
  '[Zones] Archive Zone',
  props<{ zoneId: number }>(),
);

export const archiveZoneSuccess = createAction(
  '[Zones] Archive Zone Success',
  props<{ zoneId: number }>(),
);

export const archiveZoneFailure = createAction(
  '[Zones] Archive Zone Failure',
  props<{ error: string }>(),
);

export const setZonesSearch = createAction(
  '[Zones] Set Search',
  props<{ search: string }>(),
);

export const clearZoneFilters = createAction('[Zones] Clear Filters');
export const clearSelectedZone = createAction('[Zones] Clear Selected Zone');
export const clearZonesError = createAction('[Zones] Clear Error');