import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { PerilsEffects } from './perils.effects';
import * as PerilsActions from './perils.actions';
import { PerilService } from '../../services/peril.service';
import { PerilResponse } from '../../dtos/perils/peril-response.dto';

function collect(effect$: Observable<unknown>): unknown[] {
  const results: unknown[] = [];
  effect$.subscribe((action) => results.push(action));
  return results;
}

describe('PerilsEffects', () => {
  let actions$: Observable<Action>;
  let effects: PerilsEffects;
  let perilService: Record<string, ReturnType<typeof vi.fn>>;
  const peril = { id: 1, perilCode: 'FLOOD' } as PerilResponse;

  beforeEach(() => {
    perilService = {
      getAllPerils: vi.fn(),
      updatePeril: vi.fn(),
      archivePeril: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        PerilsEffects,
        provideMockActions(() => actions$),
        { provide: PerilService, useValue: perilService },
      ],
    });
    effects = TestBed.inject(PerilsEffects);
  });

  it('loads perils', () => {
    perilService['getAllPerils'].mockReturnValue(of([peril]));
    actions$ = of(PerilsActions.loadPerils());

    expect(collect(effects.loadPerils$)).toEqual([PerilsActions.loadPerilsSuccess({ perils: [peril] })]);
  });

  it('maps load errors', () => {
    perilService['getAllPerils'].mockReturnValue(throwError(() => ({ message: 'Timeout' })));
    actions$ = of(PerilsActions.loadPerils());

    expect(collect(effects.loadPerils$)).toEqual([PerilsActions.loadPerilsFailure({ error: 'Timeout' })]);
  });

  it('updates a peril', () => {
    perilService['updatePeril'].mockReturnValue(of(peril));
    actions$ = of(PerilsActions.updatePeril({ perilId: 1, request: {} as never }));

    expect(collect(effects.updatePeril$)).toEqual([PerilsActions.updatePerilSuccess({ peril })]);
  });

  it('archives a peril', () => {
    perilService['archivePeril'].mockReturnValue(of({ message: 'ok' }));
    actions$ = of(PerilsActions.archivePeril({ perilId: 1 }));

    expect(collect(effects.archivePeril$)).toEqual([PerilsActions.archivePerilSuccess({ perilId: 1 })]);
  });
});
