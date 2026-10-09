import { NotificationResponse } from '../../dtos/notifications/notification-response.dto';

export interface NotificationsState {
  notifications: NotificationResponse[];
  unreadCount: number;
  isLoading: boolean;
  isSaving: boolean;
  refreshing: boolean;
  loaded: boolean;
  polling: boolean;
  lastLoadedAt: string | null;
  lastSeenNotificationCreatedAt: string | null;
  error: string | null;
  // Admin console list. Kept apart from `notifications`,
  // which holds the signed-in user's own inbox and is refreshed by polling.
  adminNotifications: NotificationResponse[];
  adminLoading: boolean;
  adminError: string | null;
  selectedNotificationId: number | null;
  filters: {
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    unreadOnly: boolean;
  };
  pagination: {
    page: number;
    size: number;
    total: number;
  };
}

export const initialNotificationsState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isSaving: false,
  refreshing: false,
  loaded: false,
  polling: false,
  lastLoadedAt: null,
  lastSeenNotificationCreatedAt: null,
  error: null,
  adminNotifications: [],
  adminLoading: false,
  adminError: null,
  selectedNotificationId: null,
  filters: {
    unreadOnly: false,
  },
  pagination: {
    page: 0,
    size: 20,
    total: 0,
  },
};