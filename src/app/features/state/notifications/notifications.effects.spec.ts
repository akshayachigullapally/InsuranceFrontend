import { TestBed } from '@angular/core/testing';
import { Action, Store, provideStore } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { NotificationResponse } from '../../dtos/notifications/notification-response.dto';
import { NotificationService } from '../../services/notification.service';
import { ToastService } from '../../../shared/services/toast.service';
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
  let toastService: ToastService;

  beforeEach(() => {
    actions$ = new Subject<Action>();
    const serviceMock: Record<string, ReturnType<typeof vi.fn>> = {};
    for (const method of SERVICE_METHODS) {
      serviceMock[method] = vi.fn().mockReturnValue(of([]));
    }
    service = serviceMock as unknown as NotificationService;
    toastService = { show: vi.fn() } as unknown as ToastService;

    TestBed.configureTestingModule({
      providers: [
        provideStore({ notifications: notificationsReducer, auth: authReducer }),
        provideMockActions(() => actions$),
        { provide: NotificationService, useValue: service },
        { provide: ToastService, useValue: toastService },
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

  it('stops polling and clears notifications on logout', () => {
    const stopResults: Action[] = [];
    const clearResults: Action[] = [];
    const stopSub = effects.stopPollingOnLogout$.subscribe((action) => stopResults.push(action));
    const clearSub = effects.clearOnLogout$.subscribe((action) => clearResults.push(action));

    actions$.next(AuthActions.logout());
    expect(stopResults).toEqual([NotificationsActions.stopNotificationPolling()]);
    expect(clearResults).toEqual([NotificationsActions.clearNotificationsOnLogout()]);
    stopSub.unsubscribe();
    clearSub.unsubscribe();
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

  it('performs a full load the first time and an incremental load afterwards', () => {
    const existing = makeNotification(1, '2026-09-01T00:00:00Z');
    const serviceNotifications = [
      makeNotification(2, '2026-09-03T00:00:00Z'),
      existing,
    ];
    vi.mocked(service.getMyNotifications).mockReturnValue(of([existing]));
    vi.mocked(service.getMyNotificationsCreatedAfter).mockReturnValue(
      of(serviceNotifications),
    );

    const store = TestBed.inject(Store);
    const results: Action[] = [];
    const sub = effects.loadNotifications$.subscribe((action) => results.push(action));

    actions$.next(NotificationsActions.notificationPollTick());
    expect(service.getMyNotifications).toHaveBeenCalledTimes(1);
    expect(service.getMyNotificationsCreatedAfter).not.toHaveBeenCalled();
    expect(results[0]).toEqual(
      NotificationsActions.loadNotificationsSuccess({ notifications: [existing] }),
    );

    store.dispatch(
      NotificationsActions.loadNotificationsSuccess({ notifications: [existing] }),
    );

    results.length = 0;
    actions$.next(NotificationsActions.notificationPollTick());
    expect(service.getMyNotificationsCreatedAfter).toHaveBeenCalledTimes(1);
    expect(service.getMyNotificationsCreatedAfter).toHaveBeenCalledWith(
      expect.any(String),
    );
    const incremental = results[0] as ReturnType<
      typeof NotificationsActions.mergeNewNotifications
    >;
    expect(incremental.type).toBe(NotificationsActions.mergeNewNotifications.type);
    expect(incremental.notifications.map((n) => n.id)).toEqual([2]);

    sub.unsubscribe();
  });

  it('emits nothing for an incremental poll that has no new notifications', () => {
    const existing = makeNotification(1, '2026-09-01T00:00:00Z');
    vi.mocked(service.getMyNotifications).mockReturnValue(of([existing]));
    vi.mocked(service.getMyNotificationsCreatedAfter).mockReturnValue(of([existing]));

    const store = TestBed.inject(Store);
    store.dispatch(
      NotificationsActions.loadNotificationsSuccess({ notifications: [existing] }),
    );

    const results: Action[] = [];
    const sub = effects.loadNotifications$.subscribe((action) => results.push(action));

    actions$.next(NotificationsActions.notificationPollTick());
    expect(results).toEqual([]);

    sub.unsubscribe();
  });

  it('logs the user out when polling hits a 401', () => {
    vi.mocked(service.getMyNotifications).mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }),
      ),
    );

    const results: Action[] = [];
    const sub = effects.loadNotifications$.subscribe((action) => results.push(action));

    actions$.next(NotificationsActions.notificationPollTick());
    expect(results).toEqual([AuthActions.logout()]);
    sub.unsubscribe();
  });

  it('emits a failure action for non-auth polling errors', () => {
    vi.mocked(service.getMyNotifications).mockReturnValue(
      throwError(() => new Error('boom')),
    );

    const results: Action[] = [];
    const sub = effects.loadNotifications$.subscribe((action) => results.push(action));

    actions$.next(NotificationsActions.notificationPollTick());
    expect(results[0].type).toBe(NotificationsActions.loadNotificationsFailure.type);
    sub.unsubscribe();
  });

  it('refreshes the unread count after a poll tick', () => {
    vi.mocked(service.getUnreadCount).mockReturnValue(of({ count: 2 }));

    const results: Action[] = [];
    const sub = effects.refreshUnreadCount$.subscribe((action) => results.push(action));

    actions$.next(NotificationsActions.notificationPollTick());
    expect(service.getUnreadCount).toHaveBeenCalledTimes(1);
    expect(results[0]).toEqual(NotificationsActions.loadUnreadCountSuccess({ count: 2 }));
    sub.unsubscribe();
  });

  it('shows a toast only for important unread notifications', () => {
    const important = makeNotification(3, '2026-09-01T00:00:00Z', {
      type: 'PAYOUT_SUCCESS',
      title: 'Payout released',
      message: 'Your payout of 500.00 is on its way.',
    });

    const sub = effects.showToastsForNewNotifications$.subscribe();
    actions$.next(
      NotificationsActions.mergeNewNotifications({
        notifications: [important, makeNotification(4, '2026-09-01T00:00:00Z')],
      }),
    );

    expect(toastService.show).toHaveBeenCalledTimes(1);
    expect(toastService.show).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Payout released' }),
    );
    sub.unsubscribe();
  });
});