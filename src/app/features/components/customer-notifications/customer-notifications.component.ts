import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, filter, map, Subscription, take } from 'rxjs';
import {
  NotificationResponse,
  NotificationType,
  NotificationPreferenceResponse,
} from '../../dtos/notifications/notification-response.dto';
import {
  selectNotifications,
  selectNotificationsLoading,
  selectNotificationsRefreshing,
  selectNotificationsError,
  selectUnreadCount,
  selectPreferences,
} from '../../state/notifications/notifications.selectors';
import {
  loadNotifications,
  refreshNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  loadPreferences,
  upsertPreference,
} from '../../state/notifications/notifications.actions';
import {
  getNotificationIcon,
  getNotificationColor,
  formatNotificationType,
  formatTimeAgo,
} from '../../utils/notification-utils';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { selectIsAuthenticated } from '../../state/auth/auth.selectors';

@Component({
  selector: 'app-customer-notifications',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  templateUrl: './customer-notifications.component.html',
  styleUrl: './customer-notifications.component.css',
})
export class CustomerNotificationsComponent implements OnInit, OnDestroy {
  notifications$: Observable<NotificationResponse[]>;
  unreadCount$: Observable<number>;
  isLoading$: Observable<boolean>;
  refreshing$: Observable<boolean>;
  error$: Observable<string | null>;
  preferences$: Observable<NotificationPreferenceResponse[]>;

  sortedNotifications$: Observable<NotificationResponse[]>;

  private preferences: NotificationPreferenceResponse[] = [];
  private preferencesSub: Subscription = Subscription.EMPTY;

  constructor(private readonly store: Store) {
    this.notifications$ = this.store.select(selectNotifications);
    this.unreadCount$ = this.store.select(selectUnreadCount);
    this.isLoading$ = this.store.select(selectNotificationsLoading);
    this.refreshing$ = this.store.select(selectNotificationsRefreshing);
    this.error$ = this.store.select(selectNotificationsError);
    this.preferences$ = this.store.select(selectPreferences);

    this.sortedNotifications$ = this.notifications$.pipe(
      map((notifications) =>
        [...notifications].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      ),
    );
  }

  ngOnInit(): void {
    this.store
      .select(selectIsAuthenticated)
      .pipe(
        filter((authenticated) => authenticated),
        take(1),
      )
      .subscribe(() => {
        this.store.dispatch(loadNotifications());
        this.store.dispatch(loadPreferences());
      });
    this.preferencesSub = this.preferences$.subscribe((p) => (this.preferences = p));
  }

  ngOnDestroy(): void {
    this.preferencesSub.unsubscribe();
  }

  markAsRead(notificationId: number): void {
    this.store.dispatch(markAsRead({ notificationId }));
  }

  markAllAsRead(): void {
    this.store.dispatch(markAllAsRead());
  }

  refresh(): void {
    this.store.dispatch(refreshNotifications());
  }

  deleteNotification(notificationId: number): void {
    this.store.dispatch(deleteNotification({ notificationId }));
  }

  isChannelEnabled(type: NotificationType, channel: 'inAppEnabled' | 'emailEnabled' | 'smsEnabled'): boolean {
    const pref = this.preferences.find((p) => p.notificationType === type);
    if (!pref) return true;
    return pref[channel];
  }

  togglePreference(type: NotificationType, channel: 'inAppEnabled' | 'emailEnabled' | 'smsEnabled'): void {
    const enabled = !this.isChannelEnabled(type, channel);
    const request = { notificationType: type } as { notificationType: NotificationType; [k: string]: unknown };
    request[channel] = enabled;
    this.store.dispatch(upsertPreference({ request }));
  }

  getNotificationIcon(type: string): string {
    return getNotificationIcon(type);
  }

  getNotificationColor(type: string): string {
    return getNotificationColor(type);
  }

  formatNotificationType(type: string): string {
    return formatNotificationType(type);
  }

  formatTimeAgo(dateString: string): string {
    return formatTimeAgo(dateString);
  }
}
