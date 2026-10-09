import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, timer } from 'rxjs';
import {
  catchError,
  exhaustMap,
  filter,
  map,
  mergeMap,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { NotificationResponse } from '../../dtos/notifications/notification-response.dto';
import { NotificationService } from '../../services/notification.service';
import * as NotificationsActions from './notifications.actions';
import * as AuthActions from '../auth/auth.actions';
import * as NotificationsSelectors from './notifications.selectors';
import { NotificationPushService } from '../../services/notification-push.service';

const NOTIFICATION_POLL_INTERVAL_MS = 30000;

function notificationKey(n: NotificationResponse): string {
  return n.id !== undefined && n.id !== null ? `id:${n.id}` : `ref:${n.notificationReference}`;
}

@Injectable()
export class NotificationsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly notificationService: NotificationService,
    private readonly store: Store,
    private readonly push: NotificationPushService,
  ) {}

  startPollingOnAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        AuthActions.loginSuccess,
        AuthActions.registerSuccess,
        AuthActions.restoreSessionSuccess,
        AuthActions.refreshTokenSuccess,
      ),
      filter((action: any) => {
        // Start polling/SSE for every authenticated role, not just customers -
        // staff (e.g. ROLE_ADMIN) also receive real notifications (see
        // FinancialService.notifyRole("ADMIN", ...) for reconciliation events)
        // and the header bell is shared across all authenticated layouts.
        const role = action?.auth?.user?.role ?? action?.user?.role ?? null;
        return !!role;
      }),
      map(() => NotificationsActions.startNotificationPolling()),
    ),
  );

  stopPollingOnLogout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        AuthActions.logout,
        AuthActions.logoutSuccess,
        AuthActions.restoreSessionFailure,
        AuthActions.refreshTokenFailure,
        AuthActions.loadCurrentUserFailure,
      ),
      map(() => NotificationsActions.stopNotificationPolling()),
    ),
  );

  clearOnLogout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        AuthActions.logout,
        AuthActions.logoutSuccess,
        AuthActions.restoreSessionFailure,
        AuthActions.refreshTokenFailure,
        AuthActions.loadCurrentUserFailure,
      ),
      map(() => NotificationsActions.clearNotificationsOnLogout()),
    ),
  );

  polling$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActions.startNotificationPolling),
      switchMap(() =>
        timer(0, NOTIFICATION_POLL_INTERVAL_MS).pipe(
          takeUntil(this.actions$.pipe(ofType(NotificationsActions.stopNotificationPolling))),
          map(() => NotificationsActions.notificationPollTick()),
        ),
      ),
    ),
  );

  // Start/stop SSE connection when polling starts/stops
  startPush$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(NotificationsActions.startNotificationPolling),
        tap(() => this.push.connect()),
      ),
    { dispatch: false },
  );

  stopPush$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(NotificationsActions.stopNotificationPolling),
        tap(() => this.push.disconnect()),
      ),
    { dispatch: false },
  );

  /**
   * Loads the whole inbox on the first load, on Refresh and on every poll tick, so the
   * list always matches the server (a missed live event, a read or a delete elsewhere
   * is picked up within one poll). Items not seen before are also emitted as
   * mergeNewNotifications so the bell pops them up. switchMap: a Refresh clicked while a
   * poll is in flight restarts the load instead of being dropped, and every load ends in
   * a success or failure action, so "Refreshing…" can never get stuck.
   */
  loadNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        NotificationsActions.loadNotifications,
        NotificationsActions.refreshNotifications,
        NotificationsActions.notificationPollTick,
      ),
      switchMap((action) =>
        this.notificationService.getMyNotifications().pipe(
          withLatestFrom(
            this.store.select(NotificationsSelectors.selectNotificationsLoaded),
            this.store.select(NotificationsSelectors.selectNotifications),
          ),
          mergeMap(([notifications, loaded, existing]) => {
            const done = NotificationsActions.loadNotificationsSuccess({ notifications });
            if (!loaded) {
              return of(done);
            }
            const known = new Set(existing.map(notificationKey));
            const fresh = notifications.filter((n) => !known.has(notificationKey(n)));
            return fresh.length
              ? of(NotificationsActions.mergeNewNotifications({ notifications: fresh }), done)
              : of(done);
          }),
          catchError((error) =>
            of(this.handleInboxError(error, action.type === NotificationsActions.notificationPollTick.type)),
          ),
        ),
      ),
    ),
  );

  refreshUnreadCount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        NotificationsActions.notificationPollTick,
        NotificationsActions.loadUnreadCount,
        NotificationsActions.markAsReadSuccess,
        NotificationsActions.markAllAsReadSuccess,
        NotificationsActions.deleteNotificationSuccess,
        NotificationsActions.mergeNewNotifications,
      ),
      exhaustMap(() =>
        this.notificationService.getUnreadCount().pipe(
          map((response) => NotificationsActions.loadUnreadCountSuccess({ count: response.count })),
          catchError(() =>
            of(
              NotificationsActions.loadUnreadCountFailure({
                error: 'Failed to refresh unread count',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // New-notification popup is rendered by HeaderComponent, anchored directly
  // below the notification bell (see mergeNewNotifications subscription there),
  // so it is not duplicated here via the generic ToastService.

  loadUnreadNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActions.loadUnreadNotifications),
      mergeMap(() =>
        this.notificationService.getMyUnreadNotifications().pipe(
          map((notifications) =>
            NotificationsActions.loadUnreadNotificationsSuccess({ notifications }),
          ),
          catchError((error) =>
            of(
              NotificationsActions.loadUnreadNotificationsFailure({
                error: this.errorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  markAsRead$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActions.markAsRead),
      exhaustMap(({ notificationId }) =>
        this.notificationService.markAsRead(notificationId).pipe(
          map((notification) => NotificationsActions.markAsReadSuccess({ notification })),
          catchError((error) =>
            of(NotificationsActions.markAsReadFailure({ error: this.errorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  markAllAsRead$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActions.markAllAsRead),
      exhaustMap(() =>
        this.notificationService.markAllAsRead().pipe(
          map(() => NotificationsActions.markAllAsReadSuccess()),
          catchError((error) =>
            of(NotificationsActions.markAllAsReadFailure({ error: this.errorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  deleteNotification$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActions.deleteNotification),
      exhaustMap(({ notificationId }) =>
        this.notificationService.deleteNotification(notificationId).pipe(
          map(() => NotificationsActions.deleteNotificationSuccess({ notificationId })),
          catchError((error) =>
            of(NotificationsActions.deleteNotificationFailure({ error: this.errorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  loadAllNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActions.loadAllNotifications),
      mergeMap(() =>
        this.notificationService.getAllNotifications().pipe(
          map((notifications) =>
            NotificationsActions.loadAllNotificationsSuccess({ notifications }),
          ),
          catchError((error) =>
            of(
              NotificationsActions.loadAllNotificationsFailure({ error: this.errorMessage(error) }),
            ),
          ),
        ),
      ),
    ),
  );

  private handleInboxError(
    error: unknown,
    _background: boolean,
  ):
    | ReturnType<typeof AuthActions.logout>
    | ReturnType<typeof NotificationsActions.loadNotificationsFailure> {
    if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
      return AuthActions.logout();
    }
    return NotificationsActions.loadNotificationsFailure({
      error: this.errorMessage(error),
    });
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error) {
        return error.error;
      }
      return error.message || `Request failed (${error.status})`;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Something went wrong';
  }
}
