import { PerilResponse } from '../../dtos/perils/peril-response.dto';

export interface PerilsState {
  perils: PerilResponse[];
  selectedPeril: PerilResponse | null;
  search: string;
  isLoading: boolean;
  isSaving: boolean;
  updatingPerilId: number | null;
  error: string | null;
}

export const initialPerilsState: PerilsState = {
  perils: [],
  selectedPeril: null,
  search: '',
  isLoading: false,
  isSaving: false,
  updatingPerilId: null,
  error: null,
};
