import { Component, OnInit, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { NotificationResponse } from '../../dtos/notifications/notification-response.dto';
import {
  selectAdminNotifications,
  selectAdminNotificationsError,
  selectAdminNotificationsLoading,
} from '../../state/notifications/notifications.selectors';
import { loadAllNotifications } from '../../state/notifications/notifications.actions';
import {
  formatDateTime,
  formatNotificationType,
  formatTimeAgo,
  getNotificationColor,
  getNotificationIcon,
} from '../../utils/notification-utils';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/** Every notification sent on the platform, newest first. */
@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [EmptyStateComponent, ErrorMessageComponent, LoadingSpinnerComponent],
  templateUrl: './admin-notifications.component.html',
  styleUrl: './admin-notifications.component.css',
})
export class AdminNotificationsComponent implements OnInit {
  protected readonly search = signal('');

  private readonly store: Store;
  protected readonly notifications;
  protected readonly loading;
  protected readonly error;

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const list = this.notifications() ?? [];
    if (!term) {
      return list;
    }
    return list.filter(notification =>
      [notification.title, notification.message, notification.type, this.recipient(notification)]
        .some(value => value?.toLowerCase().includes(term)));
  });

  constructor(store: Store) {
    this.store = store;
    this.notifications = toSignal(this.store.select(selectAdminNotifications), { initialValue: [] });
    this.loading = toSignal(this.store.select(selectAdminNotificationsLoading), { initialValue: false });
    this.error = toSignal(this.store.select(selectAdminNotificationsError), { initialValue: null });
  }

  ngOnInit(): void {
    this.refresh();
  }

  protected refresh(): void {
    this.store.dispatch(loadAllNotifications());
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected recipient(notification: NotificationResponse): string {
    if (notification.recipientUserId) {
      return `User #${notification.recipientUserId}`;
    }
    if (notification.recipientCustomerId) {
      return `Customer #${notification.recipientCustomerId}`;
    }
    if (notification.recipientRole) {
      const role = notification.recipientRole.replace(/^ROLE_/, '').replaceAll('_', ' ').toLowerCase();
      return `All ${role}s`;
    }
    return '—';
  }

  protected icon(type: string): string {
    return getNotificationIcon(type);
  }

  protected color(type: string): string {
    return getNotificationColor(type);
  }

  protected typeLabel(type: string): string {
    return formatNotificationType(type);
  }

  protected timeAgo(value: string): string {
    return formatTimeAgo(value);
  }

  protected dateTime(value: string): string {
    return formatDateTime(value);
  }
}
