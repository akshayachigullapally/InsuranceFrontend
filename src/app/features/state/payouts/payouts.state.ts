import { PayoutResponse } from '../../dtos/financial/payout-response.dto';

export interface PayoutsState {
  payouts: PayoutResponse[];
  selectedPayout: PayoutResponse | null;
  search: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export const initialPayoutsState: PayoutsState = {
  payouts: [],
  selectedPayout: null,
  search: '',
  isLoading: false,
  isSaving: false,
  error: null,
};
