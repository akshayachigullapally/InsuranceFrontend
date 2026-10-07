import { usersReducer } from './users.reducers';
import { initialUsersState, UsersState } from './users.state';
import * as UsersActions from './users.actions';
import { UserResponse } from '../../dtos/auth/user-response.dto';

function makeUser(id: number, overrides: Partial<UserResponse> = {}): UserResponse {
  return { id, fullName: `User ${id}`, email: `u${id}@example.com`, role: 'ROLE_CUSTOMER', profileStatus: 'ACTIVE', ...overrides };
}

describe('usersReducer', () => {
  it('returns the initial state for an unknown action', () => {
    expect(usersReducer(undefined, { type: '[Unknown]' } as never)).toEqual(initialUsersState);
  });

  it('updates an existing user when a single user loads', () => {
    const current: UsersState = { ...initialUsersState, users: [makeUser(1)] };
    const updated = makeUser(1, { fullName: 'Renamed' });

    const state = usersReducer(current, UsersActions.loadUserSuccess({ user: updated }));

    expect(state.selectedUser).toEqual(updated);
    expect(state.users[0].fullName).toBe('Renamed');
  });

  it('keeps an updated user that still matches the filter', () => {
    const current: UsersState = { ...initialUsersState, users: [makeUser(1)], updatingUserId: 1 };

    const state = usersReducer(
      current,
      UsersActions.updateUserStatusSuccess({ user: makeUser(1, { profileStatus: 'SUSPENDED' }) }),
    );

    expect(state.users[0].profileStatus).toBe('SUSPENDED');
    expect(state.updatingUserId).toBeNull();
  });

  it('drops an updated user that no longer matches the status filter', () => {
    const current: UsersState = { ...initialUsersState, users: [makeUser(1), makeUser(2)], selectedStatus: 'ACTIVE' };

    const state = usersReducer(
      current,
      UsersActions.updateUserStatusSuccess({ user: makeUser(1, { profileStatus: 'SUSPENDED' }) }),
    );

    expect(state.users.map((user) => user.id)).toEqual([2]);
  });
});
