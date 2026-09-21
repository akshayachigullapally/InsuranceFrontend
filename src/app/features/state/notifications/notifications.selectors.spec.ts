import { NotificationResponse } from '../../dtos/notifications/notification-response.dto';
import { initialNotificationsState, NotificationsState } from './notifications.state';
import {
  selectNotificationsLoaded,
  selectLastSeenNotificationCreatedAt,
  selectLastLoadedAt,
  selectPollingActive,
  selectUnreadNotifications,
  selectReadNotifications,
  selectLatestNotifications,
  selectUnreadCount,
  selectFilteredNotifications,
  selectPaginatedNotifications,
} from './notifications.selectors';

function makeNotification(
  id: number,
  createdAt: string,
  options: Partial<NotificationResponse> = {},
): NotificationResponse {
  return {
    id,
    notificationReference: `REF-${id}`,
    recipientUserId: 1,
    recipientCustomerId: null,
    recipientRole: 'CUSTOMER',
    type: 'GENERAL',
    title: `Notification ${id}`,
    message: `Message ${id}`,
    relatedEntityType: null,
    relatedEntityId: null,
    read: false,
    readAt: null,
    deliveryChannel: 'IN_APP',
    deliveryStatus: 'DELIVERED',
    retryCount: 0,
    maxRetries: 3,
    correlationId: null,
    idempotencyKey: null,
    createdAt,
    updatedAt: null,
    ...options,
  };
}

function buildState(overrides: Partial<NotificationsState> = {}): NotificationsState {
  return { ...initialNotificationsState, ...overrides };
}

describe('notifications selectors', () => {
  const notifications = [
    makeNotification(1, '2026-09-01T00:00:00Z', { read: true }),
    makeNotification(2, '2026-09-02T00:00:00Z'),
    makeNotification(3, '2026-09-03T00:00:00Z'),
    makeNotification(4, '2026-09-04T00:00:00Z', { read: true }),
    makeNotification(5, '2026-09-05T00:00:00Z'),
    makeNotification(6, '2026-09-06T00:00:00Z'),
  ];

  it('exposes the loading bookkeeping flags', () => {
    const state = buildState({ loaded: true, polling: true, lastLoadedAt: 'x', lastSeenNotificationCreatedAt: 'y' });
    expect(selectNotificationsLoaded.projector(state)).toBe(true);
    expect(selectPollingActive.projector(state)).toBe(true);
    expect(selectLastLoadedAt.projector(state)).toBe('x');
    expect(selectLastSeenNotificationCreatedAt.projector(state)).toBe('y');
  });

  it('splits notifications into unread and read', () => {
    const state = buildState({ notifications });
    expect(selectUnreadNotifications.projector(notifications)).toHaveLength(4);
    expect(selectReadNotifications.projector(notifications)).toHaveLength(2);
  });

  it('returns the latest five notifications', () => {
    const state = buildState({ notifications });
    expect(selectLatestNotifications.projector(notifications)).toHaveLength(5);
    expect(selectLatestNotifications.projector(notifications).map((n) => n.id)).toEqual([1, 2, 3, 4, 5]);
  });

  it('exposes the unread count', () => {
    const state = buildState({ unreadCount: 4 });
    expect(selectUnreadCount.projector(state)).toBe(4);
  });

  it('filters by read state and type', () => {
    const state = buildState({
      notifications,
      filters: { unreadOnly: true, type: 'GENERAL' },
    });
    const filtered = selectFilteredNotifications.projector(notifications, state.filters);
    expect(filtered).toHaveLength(4);
  });

  it('paginates filtered notifications', () => {
    const state = buildState({
      notifications,
      filters: { unreadOnly: false },
      pagination: { page: 1, size: 2, total: notifications.length },
    });
    const page = selectPaginatedNotifications.projector(notifications, state.pagination);
    expect(page.map((n) => n.id)).toEqual([3, 4]);
  });
});