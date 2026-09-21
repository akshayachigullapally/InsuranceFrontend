import { TriggerEvaluationResponse } from '../../dtos/trigger-evaluations/trigger-evaluation-response.dto';

export interface TriggerEvaluationsState {
  evaluations: TriggerEvaluationResponse[];
  selectedEvaluation: TriggerEvaluationResponse | null;
  search: string;
  isLoading: boolean;
  error: string | null;
}

export const initialTriggerEvaluationsState: TriggerEvaluationsState = {
  evaluations: [],
  selectedEvaluation: null,
  search: '',
  isLoading: false,
  error: null,
};
