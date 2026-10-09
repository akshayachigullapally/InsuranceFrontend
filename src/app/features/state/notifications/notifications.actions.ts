import { createAction, props } from '@ngrx/store';
import { NotificationResponse } from '../../dtos/notifications/notification-response.dto';

export const loadNotifications = createAction('[Notifications] Load Notifications');

export const loadNotificationsSuccess = createAction(
  '[Notifications] Load Notifications Success',
  props<{ notifications: NotificationResponse[] }>(),
);

export const loadNotificationsFailure = createAction(
  '[Notifications] Load Notifications Failure',
  props<{ error: string }>(),
);

export const loadUnreadNotifications = createAction('[Notifications] Load Unread Notifications');

export const loadUnreadNotificationsSuccess = createAction(
  '[Notifications] Load Unread Notifications Success',
  props<{ notifications: NotificationResponse[] }>(),
);

export const loadUnreadNotificationsFailure = createAction(
  '[Notifications] Load Unread Notifications Failure',
  props<{ error: string }>(),
);

export const loadUnreadCount = createAction('[Notifications] Load Unread Count');

export const loadUnreadCountSuccess = createAction(
  '[Notifications] Load Unread Count Success',
  props<{ count: number }>(),
);

export const loadUnreadCountFailure = createAction(
  '[Notifications] Load Unread Count Failure',
  props<{ error: string }>(),
);

export const refreshNotifications = createAction('[Notifications] Refresh Notifications');

export const mergeNewNotifications = createAction(
  '[Notifications] Merge New Notifications',
  props<{ notifications: NotificationResponse[] }>(),
);

export const startNotificationPolling = createAction('[Notifications] Start Notification Polling');

export const stopNotificationPolling = createAction('[Notifications] Stop Notification Polling');

export const notificationPollTick = createAction('[Notifications] Notification Poll Tick');

export const clearNotificationsOnLogout = createAction(
  '[Notifications] Clear Notifications On Logout',
);

export const markAsRead = createAction(
  '[Notifications] Mark As Read',
  props<{ notificationId: number }>(),
);

export const markAsReadSuccess = createAction(
  '[Notifications] Mark As Read Success',
  props<{ notification: NotificationResponse }>(),
);

export const markAsReadFailure = createAction(
  '[Notifications] Mark As Read Failure',
  props<{ error: string }>(),
);

export const markAllAsRead = createAction('[Notifications] Mark All As Read');

export const markAllAsReadSuccess = createAction('[Notifications] Mark All As Read Success');

export const markAllAsReadFailure = createAction(
  '[Notifications] Mark All As Read Failure',
  props<{ error: string }>(),
);

export const deleteNotification = createAction(
  '[Notifications] Delete Notification',
  props<{ notificationId: number }>(),
);

export const deleteNotificationSuccess = createAction(
  '[Notifications] Delete Notification Success',
  props<{ notificationId: number }>(),
);

export const deleteNotificationFailure = createAction(
  '[Notifications] Delete Notification Failure',
  props<{ error: string }>(),
);

export const loadAllNotifications = createAction('[Notifications] Load All Notifications');

export const loadAllNotificationsSuccess = createAction(
  '[Notifications] Load All Notifications Success',
  props<{ notifications: NotificationResponse[] }>(),
);

export const loadAllNotificationsFailure = createAction(
  '[Notifications] Load All Notifications Failure',
  props<{ error: string }>(),
);

export const clearNotificationsError = createAction('[Notifications] Clear Error');
