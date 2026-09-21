import { QuoteResponse } from '../../dtos/financial/quote-response.dto';

export interface QuotesState {
  quotes: QuoteResponse[];
  selectedQuote: QuoteResponse | null;
  search: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export const initialQuotesState: QuotesState = {
  quotes: [],
  selectedQuote: null,
  search: '',
  isLoading: false,
  isSaving: false,
  error: null,
};
