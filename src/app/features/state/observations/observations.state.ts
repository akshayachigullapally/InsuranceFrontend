import { ObservationResponse } from '../../dtos/observations/observation-response.dto';

export interface ObservationsState {
  observations: ObservationResponse[];
  selectedObservation: ObservationResponse | null;
  search: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export const initialObservationsState: ObservationsState = {
  observations: [],
  selectedObservation: null,
  search: '',
  isLoading: false,
  isSaving: false,
  error: null,
};
