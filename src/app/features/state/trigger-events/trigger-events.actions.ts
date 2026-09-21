import { createAction, props } from '@ngrx/store';
import {
  TriggerEventResponse,
} from '../../dtos/trigger-events/trigger-event-response.dto';

export const loadTriggerEvents = createAction('[Trigger Events] Load Trigger Events');

export const loadTriggerEventsSuccess = createAction(
  '[Trigger Events] Load Trigger Events Success',
  props<{ events: TriggerEventResponse[] }>(),
);

export const loadTriggerEventsFailure = createAction(
  '[Trigger Events] Load Trigger Events Failure',
  props<{ error: string }>(),
);

export const loadTriggerEvent = createAction(
  '[Trigger Events] Load Trigger Event',
  props<{ eventId: number }>(),
);

export const loadTriggerEventSuccess = createAction(
  '[Trigger Events] Load Trigger Event Success',
  props<{ event: TriggerEventResponse }>(),
);

export const loadTriggerEventFailure = createAction(
  '[Trigger Events] Load Trigger Event Failure',
  props<{ error: string }>(),
);

export const startValidation = createAction(
  '[Trigger Events] Start Validation',
  props<{ eventId: number }>(),
);

export const startValidationSuccess = createAction(
  '[Trigger Events] Start Validation Success',
  props<{ event: TriggerEventResponse }>(),
);

export const startValidationFailure = createAction(
  '[Trigger Events] Start Validation Failure',
  props<{ error: string }>(),
);

export const verifyTriggerEvent = createAction(
  '[Trigger Events] Verify Event',
  props<{ eventId: number; reviewNotes: string }>(),
);

export const verifyTriggerEventSuccess = createAction(
  '[Trigger Events] Verify Event Success',
  props<{ event: TriggerEventResponse }>(),
);

export const verifyTriggerEventFailure = createAction(
  '[Trigger Events] Verify Event Failure',
  props<{ error: string }>(),
);

export const rejectTriggerEvent = createAction(
  '[Trigger Events] Reject Event',
  props<{ eventId: number; reviewNotes: string }>(),
);

export const rejectTriggerEventSuccess = createAction(
  '[Trigger Events] Reject Event Success',
  props<{ event: TriggerEventResponse }>(),
);

export const rejectTriggerEventFailure = createAction(
  '[Trigger Events] Reject Event Failure',
  props<{ error: string }>(),
);

export const setTriggerEventsSearch = createAction(
  '[Trigger Events] Set Search',
  props<{ search: string }>(),
);

export const clearTriggerEventFilters = createAction('[Trigger Events] Clear Filters');
export const clearSelectedTriggerEvent = createAction('[Trigger Events] Clear Selected Event');
export const clearTriggerEventsError = createAction('[Trigger Events] Clear Error');
