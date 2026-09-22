import { TriggerEventResponse } from '../../dtos/trigger-events/trigger-event-response.dto';

export interface TriggerEventsState {
  events: TriggerEventResponse[];
  selectedEvent: TriggerEventResponse | null;
  search: string;
  isLoading: boolean;
  error: string | null;
}

export const initialTriggerEventsState: TriggerEventsState = {
  events: [],
  selectedEvent: null,
  search: '',
  isLoading: false,
  error: null,
};
