import { PerilResponse } from '../../dtos/perils/peril-response.dto';
import { selectFilteredPerils } from './perils.selectors';

function peril(id: number, perilCode: string, perilName: string, description: string, status = 'ACTIVE'): PerilResponse {
  return { id, perilCode, perilName, description, status } as PerilResponse;
}

describe('perils selectors', () => {
  const perils = [
    peril(1, 'EXCESS_RAINFALL', 'Excess Rainfall', 'Rainfall above threshold'),
    peril(2, 'FLOOD', 'Flood', 'River level above threshold', 'INACTIVE'),
    peril(3, 'CYCLONE', 'Cyclone', 'High wind speed'),
  ];

  it('returns all perils for a blank search', () => {
    expect(selectFilteredPerils.projector(perils, '').length).toBe(3);
  });
});
