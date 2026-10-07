import { TestBed } from '@angular/core/testing';
import { Action, Store, provideStore } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Subject, of } from 'rxjs';
import { NotificationResponse } from '../../dtos/notifications/notification-response.dto';
import { NotificationService } from '../../services/notification.service';
import { notificationsReducer } from './notifications.reducer';
import { authReducer } from '../auth/auth.reducer';
import { NotificationsEffects } from './notifications.effects';
import * as NotificationsActions from './notifications.actions';
import * as AuthActions from '../auth/auth.actions';

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

const SERVICE_METHODS = [
  'getMyNotifications',
  'getMyNotificationsCreatedAfter',
  'getUnreadCount',
  'getMyUnreadNotifications',
  'markAsRead',
  'markAllAsRead',
  'deleteNotification',
  'getAllNotifications',
  'getFailedNotifications',
  'getMyPreferences',
  'upsertPreference',
  'createFromTemplate',
  'sendBatch',
  'getDeliveryAttempts',
  'getTemplates',
  'createTemplate',
  'updateTemplate',
  'deactivateTemplate',
  'getAuditEvents',
] as const;

describe('NotificationsEffects', () => {
  let actions$: Subject<Action>;
  let effects: NotificationsEffects;
  let service: NotificationService;

  beforeEach(() => {
    actions$ = new Subject<Action>();
    const serviceMock: Record<string, ReturnType<typeof vi.fn>> = {};
    for (const method of SERVICE_METHODS) {
      serviceMock[method] = vi.fn().mockReturnValue(of([]));
    }
    service = serviceMock as unknown as NotificationService;

    TestBed.configureTestingModule({
      providers: [
        provideStore({ notifications: notificationsReducer, auth: authReducer }),
        provideMockActions(() => actions$),
        { provide: NotificationService, useValue: service },
        NotificationsEffects,
      ],
    });

    effects = TestBed.inject(NotificationsEffects);
  });

  afterEach(() => {
    actions$.complete();
  });

  it('starts polling after a successful login', () => {
    const results: Action[] = [];
    const sub = effects.startPollingOnAuth$.subscribe((action) => results.push(action));

    actions$.next(
      AuthActions.loginSuccess({
        auth: {
          accessToken: 'access',
          refreshToken: 'refresh',
          tokenType: 'Bearer',
          expiresIn: 3600,
          user: {
            id: 1,
            fullName: 'Test User',
            email: 'test@example.com',
            role: 'CUSTOMER',
          },
        },
      }),
    );
    expect(results).toEqual([NotificationsActions.startNotificationPolling()]);
    sub.unsubscribe();
  });

  it('emits poll ticks every 30 seconds while polling and stops when asked', () => {
    vi.useFakeTimers();
    const results: Action[] = [];
    const sub = effects.polling$.subscribe((action) => results.push(action));

    actions$.next(NotificationsActions.startNotificationPolling());
    vi.advanceTimersByTime(1);
    expect(results.filter((a) => a.type === NotificationsActions.notificationPollTick.type).length).toBe(1);

    vi.advanceTimersByTime(30000);
    expect(results.filter((a) => a.type === NotificationsActions.notificationPollTick.type).length).toBe(2);

    actions$.next(NotificationsActions.stopNotificationPolling());
    vi.advanceTimersByTime(90000);
    expect(results.filter((a) => a.type === NotificationsActions.notificationPollTick.type).length).toBe(2);

    sub.unsubscribe();
    vi.useRealTimers();
  });

  it('reloads the whole inbox on every poll and pops up only the new items', () => {
    const existing = makeNotification(1, '2026-09-01T00:00:00Z');
    const newer = makeNotification(2, '2026-09-03T00:00:00Z');
    vi.mocked(service.getMyNotifications).mockReturnValueOnce(of([existing]));

    const store = TestBed.inject(Store);
    const results: Action[] = [];
    const sub = effects.loadNotifications$.subscribe((action) => results.push(action));

    actions$.next(NotificationsActions.notificationPollTick());
    expect(results).toEqual([
      NotificationsActions.loadNotificationsSuccess({ notifications: [existing] }),
    ]);
    store.dispatch(
      NotificationsActions.loadNotificationsSuccess({ notifications: [existing] }),
    );

    results.length = 0;
    vi.mocked(service.getMyNotifications).mockReturnValueOnce(of([newer, existing]));
    actions$.next(NotificationsActions.notificationPollTick());
    expect(service.getMyNotifications).toHaveBeenCalledTimes(2);
    expect(results).toEqual([
      NotificationsActions.mergeNewNotifications({ notifications: [newer] }),
      NotificationsActions.loadNotificationsSuccess({ notifications: [newer, existing] }),
    ]);

    sub.unsubscribe();
  });

  it('restarts the load when Refresh is clicked while a poll is still running', () => {
    const existing = makeNotification(1, '2026-09-01T00:00:00Z');
    const slowPoll = new Subject<NotificationResponse[]>();
    vi.mocked(service.getMyNotifications)
      .mockReturnValueOnce(slowPoll)
      .mockReturnValueOnce(of([existing]));

    const results: Action[] = [];
    const sub = effects.loadNotifications$.subscribe((action) => results.push(action));

    actions$.next(NotificationsActions.notificationPollTick());
    actions$.next(NotificationsActions.refreshNotifications());
    slowPoll.next([]);

    expect(results).toEqual([
      NotificationsActions.loadNotificationsSuccess({ notifications: [existing] }),
    ]);
    sub.unsubscribe();
  });

});