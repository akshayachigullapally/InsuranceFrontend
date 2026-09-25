import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  AuditEventResponse,
  BatchNotificationRequest,
  CreateNotificationTemplateRequest,
  DeliveryAttemptResponse,
  InternalNotificationRequest,
  MessageResponse,
  NotificationPreferenceResponse,
  NotificationRequest,
  NotificationResponse,
  NotificationTemplateResponse,
  TemplateNotificationRequest,
  UnreadCountResponse,
  UpsertNotificationPreferenceRequest,
} from '../dtos/notifications/notification-response.dto';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private readonly http: HttpClient) {}

  getMyNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(
      API_ENDPOINTS.notifications.myNotifications,
    );
  }

  getMyNotificationsCreatedAfter(createdAfterIso: string): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(
      API_ENDPOINTS.notifications.myNotifications,
      { params: new HttpParams().set('createdAfter', createdAfterIso) },
    );
  }

  getMyUnreadNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(
      API_ENDPOINTS.notifications.myUnread,
    );
  }

  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(
      API_ENDPOINTS.notifications.myUnreadCount,
    );
  }

  markAsRead(notificationId: number): Observable<NotificationResponse> {
    return this.http.put<NotificationResponse>(
      API_ENDPOINTS.notifications.markRead(notificationId),
      {},
    );
  }

  markAllAsRead(): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(
      API_ENDPOINTS.notifications.markAllRead,
      {},
    );
  }

  deleteNotification(notificationId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(
      API_ENDPOINTS.notifications.delete(notificationId),
    );
  }

  getAllNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(
      API_ENDPOINTS.notifications.adminAll,
    );
  }

  getFailedNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(
      API_ENDPOINTS.notifications.adminFailed,
    );
  }

  getMyPreferences(): Observable<NotificationPreferenceResponse[]> {
    return this.http.get<NotificationPreferenceResponse[]>(
      API_ENDPOINTS.notifications.myPreferences,
    );
  }

  upsertPreference(
    request: UpsertNotificationPreferenceRequest,
  ): Observable<NotificationPreferenceResponse> {
    return this.http.put<NotificationPreferenceResponse>(
      API_ENDPOINTS.notifications.upsertPreferences,
      request,
    );
  }

  createFromTemplate(
    request: TemplateNotificationRequest,
  ): Observable<NotificationResponse> {
    return this.http.post<NotificationResponse>(
      API_ENDPOINTS.notifications.fromTemplate,
      request,
    );
  }

  sendBatch(request: BatchNotificationRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      API_ENDPOINTS.notifications.adminBatch,
      request,
    );
  }

  getDeliveryAttempts(
    notificationId: number,
  ): Observable<DeliveryAttemptResponse[]> {
    return this.http.get<DeliveryAttemptResponse[]>(
      API_ENDPOINTS.notifications.deliveryAttempts(notificationId),
    );
  }

  getTemplates(): Observable<NotificationTemplateResponse[]> {
    return this.http.get<NotificationTemplateResponse[]>(
      API_ENDPOINTS.notifications.adminTemplates,
    );
  }

  getTemplateById(
    templateId: number,
  ): Observable<NotificationTemplateResponse> {
    return this.http.get<NotificationTemplateResponse>(
      API_ENDPOINTS.notifications.adminTemplateById(templateId),
    );
  }

  createTemplate(
    request: CreateNotificationTemplateRequest,
  ): Observable<NotificationTemplateResponse> {
    return this.http.post<NotificationTemplateResponse>(
      API_ENDPOINTS.notifications.adminTemplates,
      request,
    );
  }

  updateTemplate(
    templateId: number,
    request: CreateNotificationTemplateRequest,
  ): Observable<NotificationTemplateResponse> {
    return this.http.put<NotificationTemplateResponse>(
      API_ENDPOINTS.notifications.adminTemplateById(templateId),
      request,
    );
  }

  deactivateTemplate(templateId: number): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(
      API_ENDPOINTS.notifications.adminTemplateDeactivate(templateId),
      {},
    );
  }

  createInternal(
    request: InternalNotificationRequest,
  ): Observable<NotificationResponse> {
    return this.http.post<NotificationResponse>(
      `${API_ENDPOINTS.notifications.myNotifications.replace('/me', '')}/internal`,
      request,
    );
  }

  getAuditEvents(): Observable<AuditEventResponse[]> {
    return this.http.get<AuditEventResponse[]>(
      API_ENDPOINTS.notifications.adminAudit,
    );
  }

  getMyAuditEvents(): Observable<AuditEventResponse[]> {
    return this.http.get<AuditEventResponse[]>(
      API_ENDPOINTS.notifications.myAudit,
    );
  }
}