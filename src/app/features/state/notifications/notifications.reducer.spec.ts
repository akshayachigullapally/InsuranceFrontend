import { provideStore } from '@ngrx/store';
import { TestBed } from '@angular/core/testing';
import { NotificationResponse } from '../../dtos/notifications/notification-response.dto';
import { notificationsReducer } from './notifications.reducer';
import { initialNotificationsState } from './notifications.state';
import * as NotificationsActions from './notifications.actions';

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

describe('notificationsReducer', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore()],
    });
  });

  it('returns the initial state for an unknown action', () => {
    const state = notificationsReducer(undefined, { type: '[Unknown] Action' } as never);
    expect(state).toEqual(initialNotificationsState);
  });

  it('loads notifications sorted newest first and records last seen', () => {
    const older = makeNotification(1, '2026-09-01T00:00:00Z');
    const newer = makeNotification(2, '2026-09-02T00:00:00Z');

    const state = notificationsReducer(
      undefined,
      NotificationsActions.loadNotificationsSuccess({ notifications: [older, newer] }),
    );

    expect(state.loaded).toBe(true);
    expect(state.refreshing).toBe(false);
    expect(state.notifications.map((n) => n.id)).toEqual([2, 1]);
    expect(state.lastSeenNotificationCreatedAt).toBeTruthy();
    expect(state.lastLoadedAt).toBeTruthy();
  });

  it('merges new notifications without duplicating existing ones', () => {
    const existing = makeNotification(1, '2026-09-01T00:00:00Z', { read: true });
    let state = notificationsReducer(
      undefined,
      NotificationsActions.loadNotificationsSuccess({ notifications: [existing] }),
    );

    const duplicate = makeNotification(1, '2026-09-01T00:00:00Z', { read: true });
    const newUnread = makeNotification(2, '2026-09-03T00:00:00Z');
    const newRead = makeNotification(3, '2026-09-04T00:00:00Z', { read: true });

    state = notificationsReducer(
      state,
      NotificationsActions.mergeNewNotifications({
        notifications: [duplicate, newUnread, newRead],
      }),
    );

    expect(state.notifications).toHaveLength(3);
    expect(state.notifications.map((n) => n.id)).toEqual([3, 2, 1]);
    expect(state.unreadCount).toBe(1);
  });

  it('decrements unread count only when marking a previously unread notification as read', () => {
    const states = notificationsReducer(
      undefined,
      NotificationsActions.loadNotificationsSuccess({ notifications: [makeNotification(1, '2026-09-01T00:00:00Z')] }),
    );

    const marked = notificationsReducer(
      states,
      NotificationsActions.markAsReadSuccess({
        notification: makeNotification(1, '2026-09-01T00:00:00Z', { read: true }),
      }),
    );
    expect(marked.unreadCount).toBe(0);

    const markedAgain = notificationsReducer(
      marked,
      NotificationsActions.markAsReadSuccess({
        notification: makeNotification(1, '2026-09-01T00:00:00Z', { read: true }),
      }),
    );
    expect(markedAgain.unreadCount).toBe(0);
  });
});