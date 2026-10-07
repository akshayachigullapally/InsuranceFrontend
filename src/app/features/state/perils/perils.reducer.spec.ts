import { perilsReducer } from './perils.reducer';
import { initialPerilsState, PerilsState } from './perils.state';
import * as PerilsActions from './perils.actions';
import { PerilResponse } from '../../dtos/perils/peril-response.dto';

function makePeril(id: number, status: PerilResponse['status'] = 'ACTIVE'): PerilResponse {
  return { id, perilCode: `P${id}`, perilName: `Peril ${id}`, description: '', status } as PerilResponse;
}

describe('perilsReducer', () => {
  it('returns the initial state for an unknown action', () => {
    expect(perilsReducer(undefined, { type: '[Unknown]' } as never)).toEqual(initialPerilsState);
  });

  it('tracks and clears the peril being updated', () => {
    const updating = perilsReducer(
      { ...initialPerilsState, perils: [makePeril(1)] },
      PerilsActions.updatePerilStatus({ perilId: 1, status: 'INACTIVE' as never }),
    );
    expect(updating.updatingPerilId).toBe(1);

    const updated = perilsReducer(
      updating,
      PerilsActions.updatePerilStatusSuccess({ peril: makePeril(1, 'INACTIVE') }),
    );
    expect(updated.perils[0].status).toBe('INACTIVE');
    expect(updated.updatingPerilId).toBeNull();
  });

  it('removes an archived peril', () => {
    const current: PerilsState = { ...initialPerilsState, perils: [makePeril(1), makePeril(2)], selectedPeril: makePeril(2) };

    const state = perilsReducer(current, PerilsActions.archivePerilSuccess({ perilId: 2 }));

    expect(state.perils.map((peril) => peril.id)).toEqual([1]);
    expect(state.selectedPeril).toBeNull();
  });
});
