import { createAction, props } from '@ngrx/store';
import {
  NotificationResponse,
  NotificationPreferenceResponse,
  NotificationTemplateResponse,
  DeliveryAttemptResponse,
  MessageResponse,
  TemplateNotificationRequest,
  BatchNotificationRequest,
  AuditEventResponse,
  UpsertNotificationPreferenceRequest,
  CreateNotificationTemplateRequest,
} from '../../dtos/notifications/notification-response.dto';

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

export const clearNotificationsOnLogout = createAction('[Notifications] Clear Notifications On Logout');

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

export const loadFailedNotifications = createAction('[Notifications] Load Failed Notifications');

export const loadFailedNotificationsSuccess = createAction(
  '[Notifications] Load Failed Notifications Success',
  props<{ notifications: NotificationResponse[] }>(),
);

export const loadFailedNotificationsFailure = createAction(
  '[Notifications] Load Failed Notifications Failure',
  props<{ error: string }>(),
);

export const loadPreferences = createAction('[Notifications] Load Preferences');

export const loadPreferencesSuccess = createAction(
  '[Notifications] Load Preferences Success',
  props<{ preferences: NotificationPreferenceResponse[] }>(),
);

export const loadPreferencesFailure = createAction(
  '[Notifications] Load Preferences Failure',
  props<{ error: string }>(),
);

export const upsertPreference = createAction(
  '[Notifications] Upsert Preference',
  props<{ request: UpsertNotificationPreferenceRequest }>(),
);

export const upsertPreferenceSuccess = createAction(
  '[Notifications] Upsert Preference Success',
  props<{ preference: NotificationPreferenceResponse }>(),
);

export const upsertPreferenceFailure = createAction(
  '[Notifications] Upsert Preference Failure',
  props<{ error: string }>(),
);

export const createFromTemplate = createAction(
  '[Notifications] Create From Template',
  props<{ request: TemplateNotificationRequest }>(),
);

export const createFromTemplateSuccess = createAction(
  '[Notifications] Create From Template Success',
  props<{ notification: NotificationResponse }>(),
);

export const createFromTemplateFailure = createAction(
  '[Notifications] Create From Template Failure',
  props<{ error: string }>(),
);

export const sendBatch = createAction(
  '[Notifications] Send Batch',
  props<{ request: BatchNotificationRequest }>(),
);

export const sendBatchSuccess = createAction('[Notifications] Send Batch Success');

export const sendBatchFailure = createAction(
  '[Notifications] Send Batch Failure',
  props<{ error: string }>(),
);

export const loadDeliveryAttempts = createAction(
  '[Notifications] Load Delivery Attempts',
  props<{ notificationId: number }>(),
);

export const loadDeliveryAttemptsSuccess = createAction(
  '[Notifications] Load Delivery Attempts Success',
  props<{ attempts: DeliveryAttemptResponse[] }>(),
);

export const loadDeliveryAttemptsFailure = createAction(
  '[Notifications] Load Delivery Attempts Failure',
  props<{ error: string }>(),
);

export const loadTemplates = createAction('[Notifications] Load Templates');

export const loadTemplatesSuccess = createAction(
  '[Notifications] Load Templates Success',
  props<{ templates: NotificationTemplateResponse[] }>(),
);

export const loadTemplatesFailure = createAction(
  '[Notifications] Load Templates Failure',
  props<{ error: string }>(),
);

export const createTemplate = createAction(
  '[Notifications] Create Template',
  props<{ request: CreateNotificationTemplateRequest }>(),
);

export const createTemplateSuccess = createAction(
  '[Notifications] Create Template Success',
  props<{ template: NotificationTemplateResponse }>(),
);

export const createTemplateFailure = createAction(
  '[Notifications] Create Template Failure',
  props<{ error: string }>(),
);

export const updateTemplate = createAction(
  '[Notifications] Update Template',
  props<{ templateId: number; request: CreateNotificationTemplateRequest }>(),
);

export const updateTemplateSuccess = createAction(
  '[Notifications] Update Template Success',
  props<{ template: NotificationTemplateResponse }>(),
);

export const updateTemplateFailure = createAction(
  '[Notifications] Update Template Failure',
  props<{ error: string }>(),
);

export const deactivateTemplate = createAction(
  '[Notifications] Deactivate Template',
  props<{ templateId: number }>(),
);

export const deactivateTemplateSuccess = createAction(
  '[Notifications] Deactivate Template Success',
  props<{ templateId: number }>(),
);

export const deactivateTemplateFailure = createAction(
  '[Notifications] Deactivate Template Failure',
  props<{ error: string }>(),
);

export const loadAuditEvents = createAction('[Notifications] Load Audit Events');

export const loadAuditEventsSuccess = createAction(
  '[Notifications] Load Audit Events Success',
  props<{ events: AuditEventResponse[] }>(),
);

export const loadAuditEventsFailure = createAction(
  '[Notifications] Load Audit Events Failure',
  props<{ error: string }>(),
);

export const clearNotificationsError = createAction('[Notifications] Clear Error');