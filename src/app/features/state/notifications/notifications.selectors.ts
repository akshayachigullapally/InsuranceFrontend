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

export const selectPollingActive = createSelector(
  selectNotificationsState,
  (state: NotificationsState) => state.polling,
);

export const selectLastLoadedAt = createSelector(
  selectNotificationsState,
  (state: NotificationsState) => state.lastLoadedAt,
);

export const selectLastSeenNotificationCreatedAt = createSelector(
  selectNotificationsState,
  (state: NotificationsState) => state.lastSeenNotificationCreatedAt,
);

export const selectNotificationsError = createSelector(
  selectNotificationsState,
  (state: NotificationsState) => state.error,
);

export const selectPreferences = createSelector(
  selectNotificationsState,
  (state: NotificationsState) => state.preferences,
);

export const selectAuditEvents = createSelector(
  selectNotificationsState,
  (state: NotificationsState) => state.auditEvents,
);

const selectFilters = createSelector(
  selectNotificationsState,
  (state: NotificationsState) => state.filters,
);

const selectPagination = createSelector(
  selectNotificationsState,
  (state: NotificationsState) => state.pagination,
);

export const selectUnreadNotifications = createSelector(
  selectNotifications,
  (notifications: NotificationResponse[]) => notifications.filter((n) => !n.read),
);

export const selectReadNotifications = createSelector(
  selectNotifications,
  (notifications: NotificationResponse[]) => notifications.filter((n) => n.read),
);

export const selectLatestNotifications = createSelector(
  selectNotifications,
  (notifications: NotificationResponse[]) => notifications.slice(0, 5),
);

export const selectFilteredNotifications = createSelector(
  selectNotifications,
  selectFilters,
  (notifications: NotificationResponse[], filters) => {
    let filtered = [...notifications];

    if (filters.unreadOnly) {
      filtered = filtered.filter((n) => !n.read);
    }

    if (filters.type) {
      filtered = filtered.filter((n) => n.type === filters.type);
    }

    if (filters.status) {
      filtered = filtered.filter((n) => n.deliveryStatus === filters.status);
    }

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      filtered = filtered.filter((n) => new Date(n.createdAt).getTime() >= from);
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime();
      filtered = filtered.filter((n) => new Date(n.createdAt).getTime() <= to);
    }

    return filtered;
  },
);

export const selectPaginatedNotifications = createSelector(
  selectFilteredNotifications,
  selectPagination,
  (notifications: NotificationResponse[], pagination) => {
    const start = pagination.page * pagination.size;
    const end = start + pagination.size;
    return notifications.slice(start, end);
  },
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
