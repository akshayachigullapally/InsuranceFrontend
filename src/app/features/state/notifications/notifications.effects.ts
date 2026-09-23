import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, of, timer, EMPTY } from 'rxjs';
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
import * as AuthSelectors from '../auth/auth.selectors';
import * as NotificationsSelectors from './notifications.selectors';
import { NotificationPushService } from '../../services/notification-push.service';

const NOTIFICATION_POLL_INTERVAL_MS = 30000;

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
          takeUntil(
            this.actions$.pipe(ofType(NotificationsActions.stopNotificationPolling)),
          ),
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

  loadNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        NotificationsActions.loadNotifications,
        NotificationsActions.refreshNotifications,
        NotificationsActions.notificationPollTick,
      ),
      withLatestFrom(
        this.store.select(NotificationsSelectors.selectNotificationsLoaded),
        this.store.select(NotificationsSelectors.selectLastSeenNotificationCreatedAt),
        this.store.select(NotificationsSelectors.selectNotifications),
      ),
      exhaustMap(([, loaded, lastSeen, existing]) => {
        const incremental = loaded && !!lastSeen;
        const source$: Observable<NotificationResponse[]> = incremental
          ? this.notificationService.getMyNotificationsCreatedAfter(lastSeen)
          : this.notificationService.getMyNotifications();
        return source$.pipe(
          mergeMap((notifications) => {
            if (incremental) {
              const existingKeys = new Set(
                existing.map((n) =>
                  n.id !== undefined && n.id !== null
                    ? `id:${n.id}`
                    : `ref:${n.notificationReference}`,
                ),
              );
              const trulyNew = notifications.filter(
                (n) =>
                  !existingKeys.has(
                    n.id !== undefined && n.id !== null
                      ? `id:${n.id}`
                      : `ref:${n.notificationReference}`,
                  ),
              );
              if (trulyNew.length === 0) {
                return EMPTY;
              }
              return of(
                NotificationsActions.mergeNewNotifications({
                  notifications: trulyNew,
                }),
              );
            }
            return of(
              NotificationsActions.loadNotificationsSuccess({ notifications }),
            );
          }),
          catchError((error) => of(this.handleInboxError(error, incremental))),
        );
      }),
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
          catchError(() => of(NotificationsActions.loadUnreadCountFailure({ error: 'Failed to refresh unread count' }))),
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
          map((notifications) => NotificationsActions.loadUnreadNotificationsSuccess({ notifications })),
          catchError((error) => of(NotificationsActions.loadUnreadNotificationsFailure({ error: this.errorMessage(error) }))),
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
          catchError((error) => of(NotificationsActions.markAsReadFailure({ error: this.errorMessage(error) }))),
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
          catchError((error) => of(NotificationsActions.markAllAsReadFailure({ error: this.errorMessage(error) }))),
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
          catchError((error) => of(NotificationsActions.deleteNotificationFailure({ error: this.errorMessage(error) }))),
        ),
      ),
    ),
  );

  loadAllNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActions.loadAllNotifications),
      mergeMap(() =>
        this.notificationService.getAllNotifications().pipe(
          map((notifications) => NotificationsActions.loadAllNotificationsSuccess({ notifications })),
          catchError((error) => of(NotificationsActions.loadAllNotificationsFailure({ error: this.errorMessage(error) }))),
        ),
      ),
    ),
  );

  loadFailedNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActions.loadFailedNotifications),
      mergeMap(() =>
        this.notificationService.getFailedNotifications().pipe(
          map((notifications) => NotificationsActions.loadFailedNotificationsSuccess({ notifications })),
          catchError((error) => of(NotificationsActions.loadFailedNotificationsFailure({ error: this.errorMessage(error) }))),
        ),
      ),
    ),
  );

  loadPreferences$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActions.loadPreferences),
      mergeMap(() =>
        this.notificationService.getMyPreferences().pipe(
          map((preferences) => NotificationsActions.loadPreferencesSuccess({ preferences })),
          catchError((error) => of(NotificationsActions.loadPreferencesFailure({ error: this.errorMessage(error) }))),
        ),
      ),
    ),
  );

  upsertPreference$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActions.upsertPreference),
      mergeMap(({ request }) =>
        this.notificationService.upsertPreference(request).pipe(
          map((preference) => NotificationsActions.upsertPreferenceSuccess({ preference })),
          catchError((error) => of(NotificationsActions.upsertPreferenceFailure({ error: this.errorMessage(error) }))),
        ),
      ),
    ),
  );

  createFromTemplate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActions.createFromTemplate),
      mergeMap(({ request }) =>
        this.notificationService.createFromTemplate(request).pipe(
          map((notification) => NotificationsActions.createFromTemplateSuccess({ notification })),
          catchError((error) => of(NotificationsActions.createFromTemplateFailure({ error: this.errorMessage(error) }))),
        ),
      ),
    ),
  );

  sendBatch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActions.sendBatch),
      mergeMap(({ request }) =>
        this.notificationService.sendBatch(request).pipe(
          map(() => NotificationsActions.sendBatchSuccess()),
          catchError((error) => of(NotificationsActions.sendBatchFailure({ error: this.errorMessage(error) }))),
        ),
      ),
    ),
  );

  loadDeliveryAttempts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActions.loadDeliveryAttempts),
      mergeMap(({ notificationId }) =>
        this.notificationService.getDeliveryAttempts(notificationId).pipe(
          map((attempts) => NotificationsActions.loadDeliveryAttemptsSuccess({ attempts })),
          catchError((error) => of(NotificationsActions.loadDeliveryAttemptsFailure({ error: this.errorMessage(error) }))),
        ),
      ),
    ),
  );

  loadTemplates$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActions.loadTemplates),
      mergeMap(() =>
        this.notificationService.getTemplates().pipe(
          map((templates) => NotificationsActions.loadTemplatesSuccess({ templates })),
          catchError((error) => of(NotificationsActions.loadTemplatesFailure({ error: this.errorMessage(error) }))),
        ),
      ),
    ),
  );

  createTemplate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActions.createTemplate),
      mergeMap(({ request }) =>
        this.notificationService.createTemplate(request).pipe(
          map((template) => NotificationsActions.createTemplateSuccess({ template })),
          catchError((error) => of(NotificationsActions.createTemplateFailure({ error: this.errorMessage(error) }))),
        ),
      ),
    ),
  );

  updateTemplate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActions.updateTemplate),
      mergeMap(({ templateId, request }) =>
        this.notificationService.updateTemplate(templateId, request).pipe(
          map((template) => NotificationsActions.updateTemplateSuccess({ template })),
          catchError((error) => of(NotificationsActions.updateTemplateFailure({ error: this.errorMessage(error) }))),
        ),
      ),
    ),
  );

  deactivateTemplate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActions.deactivateTemplate),
      mergeMap(({ templateId }) =>
        this.notificationService.deactivateTemplate(templateId).pipe(
          map(() => NotificationsActions.deactivateTemplateSuccess({ templateId })),
          catchError((error) => of(NotificationsActions.deactivateTemplateFailure({ error: this.errorMessage(error) }))),
        ),
      ),
    ),
  );

  loadAuditEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActions.loadAuditEvents),
      mergeMap(() =>
        this.notificationService.getAuditEvents().pipe(
          map((events) => NotificationsActions.loadAuditEventsSuccess({ events })),
          catchError((error) => of(NotificationsActions.loadAuditEventsFailure({ error: this.errorMessage(error) }))),
        ),
      ),
    ),
  );

  private handleInboxError(
    error: unknown,
    _background: boolean,
  ): ReturnType<typeof AuthActions.logout> | ReturnType<typeof NotificationsActions.loadNotificationsFailure> {
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