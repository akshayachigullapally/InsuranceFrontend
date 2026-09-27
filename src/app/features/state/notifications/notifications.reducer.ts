import { createReducer, on } from '@ngrx/store';
import {
  NotificationsState,
  initialNotificationsState,
} from './notifications.state';
import { NotificationResponse } from '../../dtos/notifications/notification-response.dto';
import * as NotificationsActions from './notifications.actions';

function mergeNotifications(
  existing: NotificationResponse[],
  incoming: NotificationResponse[],
): NotificationResponse[] {
  const seen = new Set<string>();
  const merged: NotificationResponse[] = [];
  const combined = [...incoming, ...existing];
  for (const notification of combined) {
    const key = notificationKey(notification);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    merged.push(notification);
  }
  return merged.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function notificationKey(notification: NotificationResponse): string {
  return notification.id !== undefined && notification.id !== null
    ? `id:${notification.id}`
    : `ref:${notification.notificationReference}`;
}

function countNewUnread(existing: NotificationResponse[], incoming: NotificationResponse[]): number {
  const existingKeys = new Set(existing.map(notificationKey));
  return incoming.filter((n) => !existingKeys.has(notificationKey(n)) && !n.read).length;
}

export const notificationsReducer = createReducer(
  initialNotificationsState,
  on(NotificationsActions.loadNotifications, (state) => ({
    ...state,
    isLoading: !state.loaded,
    refreshing: state.loaded,
    error: null,
  })),
  on(NotificationsActions.loadNotificationsSuccess, (state, { notifications }) => ({
    ...state,
    notifications: mergeNotifications([], notifications),
    isLoading: false,
    refreshing: false,
    loaded: true,
    lastLoadedAt: new Date().toISOString(),
    lastSeenNotificationCreatedAt: new Date().toISOString(),
    error: null,
    pagination: {
      ...state.pagination,
      total: notifications.length,
    },
  })),
  on(NotificationsActions.loadNotificationsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    refreshing: false,
    error,
  })),
  on(NotificationsActions.loadUnreadNotifications, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(NotificationsActions.loadUnreadNotificationsSuccess, (state, { notifications }) => ({
    ...state,
    notifications: mergeNotifications(state.notifications, notifications),
    isLoading: false,
  })),
  on(NotificationsActions.loadUnreadNotificationsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
  on(NotificationsActions.loadUnreadCount, (state) => ({
    ...state,
  })),
  on(NotificationsActions.loadUnreadCountSuccess, (state, { count }) => ({
    ...state,
    unreadCount: count,
  })),
  on(NotificationsActions.loadUnreadCountFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(NotificationsActions.refreshNotifications, (state) => ({
    ...state,
    refreshing: true,
    error: null,
  })),
  on(NotificationsActions.mergeNewNotifications, (state, { notifications }) => ({
    ...state,
    notifications: mergeNotifications(state.notifications, notifications),
    unreadCount: state.unreadCount + countNewUnread(state.notifications, notifications),
    refreshing: false,
    lastLoadedAt: new Date().toISOString(),
    lastSeenNotificationCreatedAt: new Date().toISOString(),
  })),
  on(NotificationsActions.startNotificationPolling, (state) => ({
    ...state,
    polling: true,
  })),
  on(NotificationsActions.stopNotificationPolling, (state) => ({
    ...state,
    polling: false,
  })),
  on(NotificationsActions.clearNotificationsOnLogout, () => initialNotificationsState),
  on(NotificationsActions.markAsRead, (state) => ({
    ...state,
    isSaving: true,
  })),
  on(NotificationsActions.markAsReadSuccess, (state, { notification }) => {
    const previous = state.notifications.find((n) => n.id === notification.id);
    const unreadBefore = previous ? !previous.read : !notification.read;
    return {
      ...state,
      notifications: state.notifications.map((n) =>
        n.id === notification.id ? notification : n,
      ),
      unreadCount: unreadBefore
        ? Math.max(0, state.unreadCount - 1)
        : state.unreadCount,
      isSaving: false,
    };
  }),
  on(NotificationsActions.markAsReadFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    error,
  })),
  on(NotificationsActions.markAllAsRead, (state) => ({
    ...state,
    isSaving: true,
  })),
  on(NotificationsActions.markAllAsReadSuccess, (state) => ({
    ...state,
    notifications: state.notifications.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() })),
    unreadCount: 0,
    isSaving: false,
  })),
  on(NotificationsActions.markAllAsReadFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    error,
  })),
  on(NotificationsActions.deleteNotification, (state) => ({
    ...state,
    isSaving: true,
  })),
  on(NotificationsActions.deleteNotificationSuccess, (state, { notificationId }) => ({
    ...state,
    notifications: state.notifications.filter((n) => n.id !== notificationId),
    unreadCount: state.notifications.find((n) => n.id === notificationId)?.read ? state.unreadCount : Math.max(0, state.unreadCount - 1),
    isSaving: false,
  })),
  on(NotificationsActions.deleteNotificationFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    error,
  })),
  on(NotificationsActions.loadAllNotifications, NotificationsActions.loadFailedNotifications, (state) => ({
    ...state,
    adminLoading: true,
    adminError: null,
    adminMessage: null,
  })),
  on(
    NotificationsActions.loadAllNotificationsSuccess,
    NotificationsActions.loadFailedNotificationsSuccess,
    (state, { notifications }) => ({
      ...state,
      adminNotifications: mergeNotifications([], notifications),
      adminLoading: false,
    }),
  ),
  on(
    NotificationsActions.loadAllNotificationsFailure,
    NotificationsActions.loadFailedNotificationsFailure,
    (state, { error }) => ({
      ...state,
      adminLoading: false,
      adminError: error,
    }),
  ),
  on(NotificationsActions.loadPreferences, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(NotificationsActions.loadPreferencesSuccess, (state, { preferences }) => ({
    ...state,
    preferences,
    isLoading: false,
  })),
  on(NotificationsActions.loadPreferencesFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
  on(NotificationsActions.upsertPreference, (state) => ({
    ...state,
    isSaving: true,
  })),
  on(NotificationsActions.upsertPreferenceSuccess, (state, { preference }) => ({
    ...state,
    preferences: state.preferences.some((p) => p.id === preference.id)
      ? state.preferences.map((p) => (p.id === preference.id ? preference : p))
      : [...state.preferences, preference],
    isSaving: false,
  })),
  on(NotificationsActions.upsertPreferenceFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    error,
  })),
  on(NotificationsActions.createFromTemplate, NotificationsActions.sendBatch, (state) => ({
    ...state,
    isSaving: true,
    adminError: null,
    adminMessage: null,
  })),
  on(
    NotificationsActions.createFromTemplateSuccess,
    NotificationsActions.sendBatchSuccess,
    (state, { notifications }) => ({
      ...state,
      adminNotifications: mergeNotifications(state.adminNotifications, notifications),
      adminMessage: `Sent ${notifications.length} notification${notifications.length === 1 ? '' : 's'}.`,
      isSaving: false,
    }),
  ),
  on(
    NotificationsActions.createFromTemplateFailure,
    NotificationsActions.sendBatchFailure,
    (state, { error }) => ({
      ...state,
      isSaving: false,
      adminError: error,
    }),
  ),
  on(NotificationsActions.loadDeliveryAttempts, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(NotificationsActions.loadDeliveryAttemptsSuccess, (state, { attempts }) => ({
    ...state,
    deliveryAttempts: attempts,
    isLoading: false,
  })),
  on(NotificationsActions.loadDeliveryAttemptsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
  on(NotificationsActions.loadTemplates, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(NotificationsActions.loadTemplatesSuccess, (state, { templates }) => ({
    ...state,
    templates,
    isLoading: false,
  })),
  on(NotificationsActions.loadTemplatesFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
  on(NotificationsActions.createTemplate, (state) => ({
    ...state,
    isSaving: true,
  })),
  on(NotificationsActions.createTemplateSuccess, (state, { template }) => ({
    ...state,
    templates: [template, ...state.templates],
    isSaving: false,
  })),
  on(NotificationsActions.createTemplateFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    error,
  })),
  on(NotificationsActions.updateTemplate, (state) => ({
    ...state,
    isSaving: true,
  })),
  on(NotificationsActions.updateTemplateSuccess, (state, { template }) => ({
    ...state,
    templates: state.templates.map((t) => (t.id === template.id ? template : t)),
    isSaving: false,
  })),
  on(NotificationsActions.updateTemplateFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    error,
  })),
  on(NotificationsActions.deactivateTemplate, (state) => ({
    ...state,
    isSaving: true,
  })),
  on(NotificationsActions.deactivateTemplateSuccess, (state, { templateId }) => ({
    ...state,
    templates: state.templates.map((t) =>
      t.id === templateId ? { ...t, active: false } : t,
    ),
    isSaving: false,
  })),
  on(NotificationsActions.deactivateTemplateFailure, (state, { error }) => ({
    ...state,
    isSaving: false,
    error,
  })),
  on(NotificationsActions.loadAuditEvents, NotificationsActions.loadMyAuditEvents, (state) => ({
    ...state,
    auditEvents: [],
    isLoading: true,
  })),
  on(NotificationsActions.loadAuditEventsSuccess, (state, { events }) => ({
    ...state,
    auditEvents: events,
    isLoading: false,
  })),
  on(NotificationsActions.loadAuditEventsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
  on(NotificationsActions.clearNotificationsError, (state) => ({
    ...state,
    error: null,
  })),
);