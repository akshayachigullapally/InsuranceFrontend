import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, filter, map, take } from 'rxjs';
import { NotificationResponse } from '../../dtos/notifications/notification-response.dto';
import {
  selectNotifications,
  selectNotificationsLoading,
  selectNotificationsRefreshing,
  selectNotificationsError,
  selectUnreadCount,
} from '../../state/notifications/notifications.selectors';
import {
  loadNotifications,
  refreshNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../../state/notifications/notifications.actions';
import { getNotificationIcon, formatTimeAgo } from '../../utils/notification-utils';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { selectIsAuthenticated } from '../../state/auth/auth.selectors';

@Component({
  selector: 'app-staff-notifications',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  templateUrl: './staff-notifications.component.html',
  styleUrl: './staff-notifications.component.css',
})
export class StaffNotificationsComponent implements OnInit, OnDestroy {
  notifications$: Observable<NotificationResponse[]>;
  unreadCount$: Observable<number>;
  isLoading$: Observable<boolean>;
  refreshing$: Observable<boolean>;
  error$: Observable<string | null>;

  sortedNotifications$: Observable<NotificationResponse[]>;

  constructor(private readonly store: Store) {
    this.notifications$ = this.store.select(selectNotifications);
    this.unreadCount$ = this.store.select(selectUnreadCount);
    this.isLoading$ = this.store.select(selectNotificationsLoading);
    this.refreshing$ = this.store.select(selectNotificationsRefreshing);
    this.error$ = this.store.select(selectNotificationsError);

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
      });
  }

  ngOnDestroy(): void {}

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

  getNotificationIcon(type: string): string {
    return getNotificationIcon(type);
  }

  formatTimeAgo(dateString: string): string {
    return formatTimeAgo(dateString);
  }
}
