import { Action, createReducer, on } from '@ngrx/store';
import { UserResponse } from '../../dtos/auth/user-response.dto';
import {
  clearSelectedUser,
  clearUsersError,
  clearUsersFilters,
  loadUser,
  loadUserFailure,
  loadUserSuccess,
  loadUsers,
  loadUsersFailure,
  loadUsersSuccess,
  setUsersSearch,
  updateUserStatus,
  updateUserStatusFailure,
  updateUserStatusSuccess,
} from './users.actions';
import {
  initialUsersState,
  UsersState,
} from './users.state';

function upsert(
  users: UserResponse[],
  user: UserResponse,
): UserResponse[] {
  const exists = users.some(item => item.id === user.id);

  return exists
    ? users.map(item => item.id === user.id ? user : item)
    : [user, ...users];
}

function updateExisting(
  users: UserResponse[],
  user: UserResponse,
): UserResponse[] {
  return users.map(item =>
    item.id === user.id ? user : item,
  );
}

export const usersReducer = createReducer(
  initialUsersState,

  on(
    loadUsers,
    (state, { status, segment }): UsersState => ({
      ...state,
      selectedStatus: status ?? null,
      selectedSegment: segment ?? null,
      isLoading: true,
      error: null,
    }),
  ),

  on(
    loadUsersSuccess,
    (state, { users }): UsersState => ({
      ...state,
      users,
      isLoading: false,
    }),
  ),

  on(
    loadUsersFailure,
    (state, { error }): UsersState => ({
      ...state,
      isLoading: false,
      error,
    }),
  ),

  on(
    loadUser,
    (state): UsersState => ({
      ...state,
      selectedUser: null,
      isLoading: true,
      error: null,
    }),
  ),

  on(
    loadUserSuccess,
    (state, { user }): UsersState => ({
      ...state,
      selectedUser: user,
      users: state.users.length
        ? updateExisting(state.users, user)
        : state.users,
      isLoading: false,
    }),
  ),

  on(
    loadUserFailure,
    (state, { error }): UsersState => ({
      ...state,
      isLoading: false,
      error,
    }),
  ),

  on(
    updateUserStatus,
    (state, { userId }): UsersState => ({
      ...state,
      isSaving: true,
      updatingUserId: userId,
      error: null,
    }),
  ),

  on(
    updateUserStatusSuccess,
    (state, { user }): UsersState => {
      const matchesStatus =
        !state.selectedStatus ||
        user.profileStatus === state.selectedStatus;

      const matchesSegment =
        !state.selectedSegment ||
        user.customerSegment === state.selectedSegment;

      return {
        ...state,
        users:
          matchesStatus && matchesSegment
            ? upsert(state.users, user)
            : state.users.filter(item => item.id !== user.id),
        selectedUser:
          state.selectedUser?.id === user.id
            ? user
            : state.selectedUser,
        isSaving: false,
        updatingUserId: null,
      };
    },
  ),

  on(
    updateUserStatusFailure,
    (state, { error }): UsersState => ({
      ...state,
      isSaving: false,
      updatingUserId: null,
      error,
    }),
  ),

  on(
    setUsersSearch,
    (state, { search }): UsersState => ({
      ...state,
      search,
    }),
  ),

  on(
    clearUsersFilters,
    (state): UsersState => ({
      ...state,
      selectedStatus: null,
      selectedSegment: null,
      search: '',
    }),
  ),

  on(
    clearSelectedUser,
    (state): UsersState => ({
      ...state,
      selectedUser: null,
    }),
  ),

  on(
    clearUsersError,
    (state): UsersState => ({
      ...state,
      error: null,
    }),
  ),
);

export function reducer(
  state: UsersState | undefined,
  action: Action,
): UsersState {
  return usersReducer(state, action);
}