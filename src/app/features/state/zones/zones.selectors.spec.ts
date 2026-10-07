import { ZoneResponse } from '../../dtos/zones/zone-response.dto';
import { selectFilteredZones } from './zones.selectors';

function zone(id: number, overrides: Partial<ZoneResponse>): ZoneResponse {
  return {
    id,
    zoneCode: `Z${id}`,
    zoneName: `Zone ${id}`,
    country: 'India',
    state: 'Telangana',
    district: 'Hyderabad',
    postalCode: '500001',
    status: 'ACTIVE',
    ...overrides,
  } as ZoneResponse;
}

describe('zones selectors', () => {
  const zones = [
    zone(1, { zoneCode: 'HYD_GACHIBOWLI', zoneName: 'Hyderabad Gachibowli Zone', postalCode: '500032' }),
    zone(2, { zoneCode: 'BANGALORE_SOUTH', zoneName: 'Bangalore South Zone', state: 'Karnataka', district: 'Bangalore', status: 'INACTIVE' }),
    zone(3, { zoneCode: 'PUNE_CENTRAL', zoneName: 'Pune Central Zone', state: 'Maharashtra', district: 'Pune', postalCode: undefined }),
  ];

  it('returns every zone for a blank search', () => {
    expect(selectFilteredZones.projector(zones, '   ').length).toBe(3);
  });
});
