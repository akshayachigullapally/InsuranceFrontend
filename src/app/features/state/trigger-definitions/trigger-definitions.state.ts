import { TriggerDefinitionResponse } from '../../dtos/trigger-definitions/trigger-definition-response.dto';

export interface TriggerDefinitionsState {
  definitions: TriggerDefinitionResponse[];
  selectedDefinition: TriggerDefinitionResponse | null;
  search: string;
  isLoading: boolean;
  isSaving: boolean;
  isEvaluating: boolean;
  updatingDefinitionId: number | null;
  error: string | null;
}

export const initialTriggerDefinitionsState: TriggerDefinitionsState = {
  definitions: [],
  selectedDefinition: null,
  search: '',
  isLoading: false,
  isSaving: false,
  isEvaluating: false,
  updatingDefinitionId: null,
  error: null,
};
