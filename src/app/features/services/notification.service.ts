import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  MessageResponse,
  NotificationResponse,
  UnreadCountResponse,
} from '../dtos/notifications/notification-response.dto';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private readonly http: HttpClient) {}

  getMyNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(API_ENDPOINTS.notifications.myNotifications);
  }

  getMyUnreadNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(API_ENDPOINTS.notifications.myUnread);
  }

  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(API_ENDPOINTS.notifications.myUnreadCount);
  }

  markAsRead(notificationId: number): Observable<NotificationResponse> {
    return this.http.put<NotificationResponse>(
      API_ENDPOINTS.notifications.markRead(notificationId),
      {},
    );
  }

  markAllAsRead(): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(API_ENDPOINTS.notifications.markAllRead, {});
  }

  deleteNotification(notificationId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(API_ENDPOINTS.notifications.delete(notificationId));
  }

  getAllNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(API_ENDPOINTS.notifications.adminAll);
  }

  /** Admin: mark any notification as read. */
  adminMarkAsRead(notificationId: number): Observable<NotificationResponse> {
    return this.http.put<NotificationResponse>(
      API_ENDPOINTS.notifications.adminMarkRead(notificationId),
      {},
    );
  }

  /** Admin: delete any notification. */
  adminDelete(notificationId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(
      API_ENDPOINTS.notifications.adminDelete(notificationId),
    );
  }
}
