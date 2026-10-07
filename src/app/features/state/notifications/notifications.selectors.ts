import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NotificationsState } from './notifications.state';
import { NotificationResponse } from '../../dtos/notifications/notification-response.dto';

const selectNotificationsState = createFeatureSelector<NotificationsState>('notifications');

export const selectNotifications = createSelector(
  selectNotificationsState,
  (state: NotificationsState) => state.notifications,
);

export const selectUnreadCount = createSelector(
  selectNotificationsState,
  (state: NotificationsState) => state.unreadCount,
);

export const selectNotificationsLoading = createSelector(
  selectNotificationsState,
  (state: NotificationsState) => state.isLoading,
);

export const selectNotificationsRefreshing = createSelector(
  selectNotificationsState,
  (state: NotificationsState) => state.refreshing,
);

export const selectNotificationsLoaded = createSelector(
  selectNotificationsState,
  (state: NotificationsState) => state.loaded,
);

export const selectNotificationsError = createSelector(
  selectNotificationsState,
  (state: NotificationsState) => state.error,
);

export const selectPreferences = createSelector(
  selectNotificationsState,
  (state: NotificationsState) => state.preferences,
);

export const selectLatestNotifications = createSelector(
  selectNotifications,
  (notifications: NotificationResponse[]) => notifications.slice(0, 5),
);

export const selectAdminNotifications = createSelector(
  selectNotificationsState,
  (state: NotificationsState) => state.adminNotifications,
);

export const selectAdminNotificationsLoading = createSelector(
  selectNotificationsState,
  (state: NotificationsState) => state.adminLoading,
);

export const selectAdminNotificationsError = createSelector(
  selectNotificationsState,
  (state: NotificationsState) => state.adminError,
);
