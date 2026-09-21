import { createAction, props } from '@ngrx/store';
import {
  CustomerSegment,
  UserResponse,
  UserStatus,
} from '../../dtos/auth/user-response.dto';

export const loadUsers = createAction(
  '[Users] Load Users',
  props<{
    status?: UserStatus;
    segment?: CustomerSegment;
  }>(),
);

export const loadUsersSuccess = createAction(
  '[Users] Load Users Success',
  props<{ users: UserResponse[] }>(),
);

export const loadUsersFailure = createAction(
  '[Users] Load Users Failure',
  props<{ error: string }>(),
);

export const loadUser = createAction(
  '[Users] Load User',
  props<{ userId: number }>(),
);

export const loadUserSuccess = createAction(
  '[Users] Load User Success',
  props<{ user: UserResponse }>(),
);

export const loadUserFailure = createAction(
  '[Users] Load User Failure',
  props<{ error: string }>(),
);

export const updateUserStatus = createAction(
  '[Users] Update User Status',
  props<{
    userId: number;
    status: UserStatus;
  }>(),
);

export const updateUserStatusSuccess = createAction(
  '[Users] Update User Status Success',
  props<{ user: UserResponse }>(),
);

export const updateUserStatusFailure = createAction(
  '[Users] Update User Status Failure',
  props<{ error: string }>(),
);

export const setUsersSearch = createAction(
  '[Users] Set Search',
  props<{ search: string }>(),
);

export const clearUsersFilters = createAction(
  '[Users] Clear Filters',
);

export const clearSelectedUser = createAction(
  '[Users] Clear Selected User',
);

export const clearUsersError = createAction(
  '[Users] Clear Error',
);