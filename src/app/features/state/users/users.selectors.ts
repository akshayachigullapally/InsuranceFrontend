import {
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import { UsersState } from './users.state';

const selectUsersState =
  createFeatureSelector<UsersState>('users');

export const selectUsers = createSelector(
  selectUsersState,
  state => state.users,
);

export const selectSelectedUser = createSelector(
  selectUsersState,
  state => state.selectedUser,
);

export const selectUsersStatus = createSelector(
  selectUsersState,
  state => state.selectedStatus,
);

export const selectUsersSegment = createSelector(
  selectUsersState,
  state => state.selectedSegment,
);

export const selectUsersSearch = createSelector(
  selectUsersState,
  state => state.search,
);

export const selectUsersLoading = createSelector(
  selectUsersState,
  state => state.isLoading,
);

export const selectUsersSaving = createSelector(
  selectUsersState,
  state => state.isSaving,
);

export const selectUpdatingUserId = createSelector(
  selectUsersState,
  state => state.updatingUserId,
);

export const selectUsersError = createSelector(
  selectUsersState,
  state => state.error,
);

export const selectFilteredUsers = createSelector(
  selectUsers,
  selectUsersSearch,
  (users, search) => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return users;
    }

    return users.filter(user => {
      const addressText = (user.addresses ?? [])
        .map(address => [
          address.addressLineOne,
          address.addressLineTwo,
          address.city,
          address.state,
          address.postalCode,
          address.country,
        ]
          .filter(Boolean)
          .join(' '))
        .join(' ')
        .toLowerCase();

      return (
        user.fullName.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        user.role.toLowerCase().includes(normalizedSearch) ||
        user.phoneNumber?.toLowerCase().includes(normalizedSearch) === true ||
        user.customerSegment?.toLowerCase().includes(normalizedSearch) === true ||
        user.profileStatus?.toLowerCase().includes(normalizedSearch) === true ||
        addressText.includes(normalizedSearch)
      );
    });
  },
);

export const selectTotalUserCount = createSelector(
  selectUsers,
  users => users.length,
);

export const selectActiveUserCount = createSelector(
  selectUsers,
  users =>
    users.filter(user =>
      user.profileStatus === 'ACTIVE',
    ).length,
);

export const selectSuspendedUserCount = createSelector(
  selectUsers,
  users =>
    users.filter(user =>
      user.profileStatus === 'SUSPENDED',
    ).length,
);

export const selectInactiveUserCount = createSelector(
  selectUsers,
  users =>
    users.filter(user =>
      user.profileStatus === 'INACTIVE',
    ).length,
);

export const selectIncompleteProfileCount = createSelector(
  selectUsers,
  users =>
    users.filter(user =>
      !user.phoneNumber ||
      !user.customerSegment ||
      !user.profileStatus,
    ).length,
);