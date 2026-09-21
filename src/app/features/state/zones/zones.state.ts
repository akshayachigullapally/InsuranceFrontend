import { ZoneResponse } from '../../dtos/zones/zone-response.dto';

export interface ZonesState {
  zones: ZoneResponse[];
  selectedZone: ZoneResponse | null;
  selectedState: string | null;
  search: string;
  isLoading: boolean;
  isSaving: boolean;
  updatingZoneId: number | null;
  error: string | null;
}

export const initialZonesState: ZonesState = {
  zones: [],
  selectedZone: null,
  selectedState: null,
  search: '',
  isLoading: false,
  isSaving: false,
  updatingZoneId: null,
  error: null,
};