import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { TriggerEventsEffects } from './trigger-events.effects';
import * as TriggerEventsActions from './trigger-events.actions';
import { TriggerEventService } from '../../services/trigger-event.service';
import { TriggerEventResponse } from '../../dtos/trigger-events/trigger-event-response.dto';

function collect(effect$: Observable<unknown>): unknown[] {
  const results: unknown[] = [];
  effect$.subscribe((action) => results.push(action));
  return results;
}

describe('TriggerEventsEffects', () => {
  let actions$: Observable<Action>;
  let effects: TriggerEventsEffects;
  let eventService: { getAllEvents: ReturnType<typeof vi.fn>; getEvent: ReturnType<typeof vi.fn> };
  const event = { id: 1, eventReference: 'EVT-1' } as TriggerEventResponse;

  beforeEach(() => {
    eventService = { getAllEvents: vi.fn(), getEvent: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        TriggerEventsEffects,
        provideMockActions(() => actions$),
        { provide: TriggerEventService, useValue: eventService },
      ],
    });
    effects = TestBed.inject(TriggerEventsEffects);
  });

  it('loads all trigger events', () => {
    eventService.getAllEvents.mockReturnValue(of([event]));
    actions$ = of(TriggerEventsActions.loadTriggerEvents());

    expect(collect(effects.loadTriggerEvents$)).toEqual([
      TriggerEventsActions.loadTriggerEventsSuccess({ events: [event] }),
    ]);
  });
});
