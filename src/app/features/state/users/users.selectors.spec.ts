import { UserResponse } from '../../dtos/auth/user-response.dto';
import {
  selectFilteredUsers,
} from './users.selectors';

function user(id: number, overrides: Partial<UserResponse>): UserResponse {
  return { id, fullName: `User ${id}`, email: `u${id}@example.com`, role: 'ROLE_CUSTOMER', ...overrides };
}

describe('users selectors', () => {
  const users = [
    user(1, {
      fullName: 'Asha Rao',
      phoneNumber: '9876543210',
      customerSegment: 'FARMER',
      profileStatus: 'ACTIVE',
      addresses: [{ city: 'Hyderabad', state: 'Telangana', country: 'India' } as never],
    }),
    user(2, { fullName: 'Ravi Kumar', profileStatus: 'SUSPENDED', customerSegment: 'SMALL_BUSINESS' }),
    user(3, { fullName: 'Uma Staff', role: 'ROLE_UNDERWRITER', profileStatus: 'INACTIVE' }),
  ];

  it('returns every user for a blank search', () => {
    expect(selectFilteredUsers.projector(users, '').length).toBe(3);
  });

  it('searches name, role, segment, status and address', () => {
    expect(selectFilteredUsers.projector(users, 'asha').map((u) => u.id)).toEqual([1]);
    expect(selectFilteredUsers.projector(users, 'underwriter').map((u) => u.id)).toEqual([3]);
    expect(selectFilteredUsers.projector(users, 'small_business').map((u) => u.id)).toEqual([2]);
    expect(selectFilteredUsers.projector(users, 'suspended').map((u) => u.id)).toEqual([2]);
    expect(selectFilteredUsers.projector(users, 'telangana').map((u) => u.id)).toEqual([1]);
  });
});
