import { PaymentResponse } from '../../dtos/financial/payment-response.dto';

export interface PaymentsState {
  payments: PaymentResponse[];
  selectedPayment: PaymentResponse | null;
  search: string;
  isLoading: boolean;
  /** True once a payments list has been fetched. */
  loaded: boolean;
  isSaving: boolean;
  error: string | null;
}

export const initialPaymentsState: PaymentsState = {
  payments: [],
  selectedPayment: null,
  search: '',
  isLoading: false,
  loaded: false,
  isSaving: false,
  error: null,
};
