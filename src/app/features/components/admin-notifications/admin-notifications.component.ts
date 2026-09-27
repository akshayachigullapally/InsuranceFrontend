import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { NotificationResponse } from '../../dtos/notifications/notification-response.dto';
import {
  selectAdminNotifications,
  selectAdminNotificationsError,
  selectAdminNotificationsLoading,
} from '../../state/notifications/notifications.selectors';
import { loadAllNotifications, loadUnreadCount } from '../../state/notifications/notifications.actions';
import { NotificationService } from '../../services/notification.service';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
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
  imports: [EmptyStateComponent, ErrorMessageComponent, LoadingSpinnerComponent, ConfirmationDialogComponent],
  templateUrl: './admin-notifications.component.html',
  styleUrl: './admin-notifications.component.css',
})
export class AdminNotificationsComponent implements OnInit {
  protected readonly search = signal('');
  protected readonly busyId = signal<number | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly deleteTarget = signal<NotificationResponse | null>(null);

  private readonly notificationService = inject(NotificationService);

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

  protected markAsRead(notification: NotificationResponse): void {
    this.run(notification.id, this.notificationService.adminMarkAsRead(notification.id), 'Could not mark it as read.');
  }

  protected askDelete(notification: NotificationResponse): void {
    this.deleteTarget.set(notification);
  }

  protected confirmDelete(): void {
    const target = this.deleteTarget();
    this.deleteTarget.set(null);
    if (target) {
      this.run(target.id, this.notificationService.adminDelete(target.id), 'Could not delete the notification.');
    }
  }

  protected dismissDelete(): void {
    this.deleteTarget.set(null);
  }

  private run(id: number, request: Observable<unknown>, failure: string): void {
    this.busyId.set(id);
    this.actionError.set(null);
    request.subscribe({
      next: () => {
        this.busyId.set(null);
        this.refresh();
        // The admin's own bell badge may have changed too.
        this.store.dispatch(loadUnreadCount());
      },
      error: (error: unknown) => {
        this.busyId.set(null);
        this.actionError.set((error as { error?: { message?: string } })?.error?.message ?? failure);
      },
    });
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
