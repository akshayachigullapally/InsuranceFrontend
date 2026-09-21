import { createAction, props } from '@ngrx/store';
import {
  TriggerDefinitionManageableStatus,
  TriggerDefinitionRequest,
  TriggerDefinitionResponse,
} from '../../dtos/trigger-definitions/trigger-definition-response.dto';

export const loadTriggerDefinitions = createAction(
  '[Trigger Definitions] Load Trigger Definitions',
);

export const loadTriggerDefinitionsSuccess = createAction(
  '[Trigger Definitions] Load Trigger Definitions Success',
  props<{ definitions: TriggerDefinitionResponse[] }>(),
);

export const loadTriggerDefinitionsFailure = createAction(
  '[Trigger Definitions] Load Trigger Definitions Failure',
  props<{ error: string }>(),
);

export const loadTriggerDefinition = createAction(
  '[Trigger Definitions] Load Trigger Definition',
  props<{ definitionId: number }>(),
);

export const loadTriggerDefinitionSuccess = createAction(
  '[Trigger Definitions] Load Trigger Definition Success',
  props<{ definition: TriggerDefinitionResponse }>(),
);

export const loadTriggerDefinitionFailure = createAction(
  '[Trigger Definitions] Load Trigger Definition Failure',
  props<{ error: string }>(),
);

export const createTriggerDefinition = createAction(
  '[Trigger Definitions] Create Trigger Definition',
  props<{ request: TriggerDefinitionRequest }>(),
);

export const createTriggerDefinitionSuccess = createAction(
  '[Trigger Definitions] Create Trigger Definition Success',
  props<{ definition: TriggerDefinitionResponse }>(),
);

export const createTriggerDefinitionFailure = createAction(
  '[Trigger Definitions] Create Trigger Definition Failure',
  props<{ error: string }>(),
);

export const updateTriggerDefinition = createAction(
  '[Trigger Definitions] Update Trigger Definition',
  props<{ definitionId: number; request: TriggerDefinitionRequest }>(),
);

export const updateTriggerDefinitionSuccess = createAction(
  '[Trigger Definitions] Update Trigger Definition Success',
  props<{ definition: TriggerDefinitionResponse }>(),
);

export const updateTriggerDefinitionFailure = createAction(
  '[Trigger Definitions] Update Trigger Definition Failure',
  props<{ error: string }>(),
);

export const updateTriggerDefinitionStatus = createAction(
  '[Trigger Definitions] Update Trigger Definition Status',
  props<{ definitionId: number; status: TriggerDefinitionManageableStatus }>(),
);

export const updateTriggerDefinitionStatusSuccess = createAction(
  '[Trigger Definitions] Update Trigger Definition Status Success',
  props<{ definition: TriggerDefinitionResponse }>(),
);

export const updateTriggerDefinitionStatusFailure = createAction(
  '[Trigger Definitions] Update Trigger Definition Status Failure',
  props<{ error: string }>(),
);

export const archiveTriggerDefinition = createAction(
  '[Trigger Definitions] Archive Trigger Definition',
  props<{ definitionId: number }>(),
);

export const archiveTriggerDefinitionSuccess = createAction(
  '[Trigger Definitions] Archive Trigger Definition Success',
  props<{ definitionId: number }>(),
);

export const archiveTriggerDefinitionFailure = createAction(
  '[Trigger Definitions] Archive Trigger Definition Failure',
  props<{ error: string }>(),
);

export const evaluateTriggerDefinition = createAction(
  '[Trigger Definitions] Evaluate Trigger Definition',
  props<{ definitionId: number; evaluationEnd?: string }>(),
);

export const evaluateTriggerDefinitionSuccess = createAction(
  '[Trigger Definitions] Evaluate Trigger Definition Success',
);

export const evaluateTriggerDefinitionFailure = createAction(
  '[Trigger Definitions] Evaluate Trigger Definition Failure',
  props<{ error: string }>(),
);

export const setTriggerDefinitionsSearch = createAction(
  '[Trigger Definitions] Set Search',
  props<{ search: string }>(),
);

export const clearTriggerDefinitionFilters = createAction(
  '[Trigger Definitions] Clear Filters',
);

export const clearSelectedTriggerDefinition = createAction(
  '[Trigger Definitions] Clear Selected Trigger Definition',
);

export const clearTriggerDefinitionsError = createAction(
  '[Trigger Definitions] Clear Error',
);
