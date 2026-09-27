import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription, combineLatest, filter, map } from 'rxjs';
import {
  NotificationResponse,
  NotificationTemplateResponse,
  NOTIFICATION_TYPES,
  NotificationType,
  DeliveryChannel,
  DELIVERY_CHANNELS,
  CreateNotificationTemplateRequest,
  TemplateNotificationRequest,
  BatchNotificationRequest,
  NotificationRequest,
} from '../../dtos/notifications/notification-response.dto';
import {
  selectAdminNotifications,
  selectAdminNotificationsLoading,
  selectAdminNotificationsError,
  selectAdminNotificationsMessage,
  selectNotificationsLoading,
  selectNotificationsError,
  selectNotificationsSaving,
  selectTemplates,
  selectDeliveryAttempts,
} from '../../state/notifications/notifications.selectors';
import {
  loadAllNotifications,
  loadFailedNotifications,
  loadTemplates,
  createTemplate,
  updateTemplate,
  deactivateTemplate,
  sendBatch,
  createFromTemplate,
  loadDeliveryAttempts,
} from '../../state/notifications/notifications.actions';
import {
  getNotificationIcon,
  getNotificationColor,
  getDeliveryStatusColor,
  formatNotificationType,
  formatTimeAgo,
  formatDateTime,
} from '../../utils/notification-utils';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

type AdminTab = 'all' | 'failed' | 'templates' | 'batch';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent],
  templateUrl: './admin-notifications.component.html',
  styleUrl: './admin-notifications.component.css',
})
export class AdminNotificationsComponent implements OnInit, OnDestroy {
  notifications$: Observable<NotificationResponse[]>;
  listLoading$: Observable<boolean>;
  isLoading$: Observable<boolean>;
  isSaving$: Observable<boolean>;
  error$: Observable<string | null>;
  message$: Observable<string | null>;
  templates$: Observable<NotificationTemplateResponse[]>;
  deliveryAttempts$ = this.store.select(selectDeliveryAttempts);
  activeTab: AdminTab = 'all';

  notificationTypes = NOTIFICATION_TYPES;
  deliveryChannels = DELIVERY_CHANNELS;
  showTemplateForm = false;
  editingTemplate: NotificationTemplateResponse | null = null;
  selectedNotificationId: number | null = null;
  templateForm: {
    templateCode: string;
    notificationType: string;
    titleTemplate: string;
    messageTemplate: string;
    defaultChannel: string;
  } = {
    templateCode: '',
    notificationType: 'GENERAL',
    titleTemplate: '',
    messageTemplate: '',
    defaultChannel: 'IN_APP',
  };

  batchForm: {
    userIds: string;
    subject: string;
    message: string;
    type: string;
    channel: string;
  } = {
    userIds: '',
    subject: '',
    message: '',
    type: 'GENERAL',
    channel: 'IN_APP',
  };

  singleSendForm: {
    userId: string;
    templateCode: string;
  } = {
    userId: '',
    templateCode: '',
  };

  private subscriptions = new Subscription();

  constructor(private readonly store: Store) {
    this.notifications$ = this.store.select(selectAdminNotifications);
    this.listLoading$ = this.store.select(selectAdminNotificationsLoading);
    this.isLoading$ = this.store.select(selectNotificationsLoading);
    this.isSaving$ = this.store.select(selectNotificationsSaving);
    this.error$ = combineLatest([
      this.store.select(selectAdminNotificationsError),
      this.store.select(selectNotificationsError),
    ]).pipe(map(([adminError, error]) => adminError ?? error));
    this.message$ = this.store.select(selectAdminNotificationsMessage);
    this.templates$ = this.store.select(selectTemplates);
  }

  ngOnInit(): void {
    this.loadNotifications();
    // A success message means the last send went through: clear the send forms.
    this.subscriptions.add(
      this.message$.pipe(filter((message) => !!message)).subscribe(() => {
        this.batchForm = { ...this.batchForm, userIds: '', subject: '', message: '' };
        this.singleSendForm = { userId: '', templateCode: '' };
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadNotifications(): void {
    if (this.activeTab === 'all') {
      this.store.dispatch(loadAllNotifications());
    } else if (this.activeTab === 'failed') {
      this.store.dispatch(loadFailedNotifications());
    } else if (this.activeTab === 'templates' || this.activeTab === 'batch') {
      this.store.dispatch(loadTemplates());
    }
  }

  switchTab(tab: AdminTab): void {
    this.activeTab = tab;
    this.showTemplateForm = false;
    this.editingTemplate = null;
    this.loadNotifications();
  }

  openCreateTemplate(): void {
    this.editingTemplate = null;
    this.showTemplateForm = true;
    this.templateForm = {
      templateCode: '',
      notificationType: 'GENERAL',
      titleTemplate: '',
      messageTemplate: '',
      defaultChannel: 'IN_APP',
    };
  }

  openEditTemplate(template: NotificationTemplateResponse): void {
    this.editingTemplate = template;
    this.showTemplateForm = true;
    this.templateForm = {
      templateCode: template.templateCode,
      notificationType: template.notificationType,
      titleTemplate: template.titleTemplate,
      messageTemplate: template.messageTemplate,
      defaultChannel: template.defaultChannel,
    };
  }

  closeTemplateForm(): void {
    this.showTemplateForm = false;
    this.editingTemplate = null;
  }

  saveTemplate(): void {
    const request: CreateNotificationTemplateRequest = {
      templateCode: this.templateForm.templateCode,
      notificationType: this.templateForm.notificationType as NotificationType,
      titleTemplate: this.templateForm.titleTemplate,
      messageTemplate: this.templateForm.messageTemplate,
      defaultChannel: this.templateForm.defaultChannel as DeliveryChannel,
    };
    if (this.editingTemplate) {
      this.store.dispatch(
        updateTemplate({ templateId: this.editingTemplate.id, request }),
      );
    } else {
      this.store.dispatch(createTemplate({ request }));
    }
    this.showTemplateForm = false;
    this.editingTemplate = null;
  }

  toggleTemplateActive(template: NotificationTemplateResponse): void {
    if (template.active) {
      this.store.dispatch(deactivateTemplate({ templateId: template.id }));
    }
  }

  onBatchSubmit(): void {
    const userIds = this.batchForm.userIds
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id !== '')
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);
    if (userIds.length === 0 || !this.batchForm.subject.trim() || !this.batchForm.message.trim()) {
      return;
    }

    const notification: Omit<NotificationRequest, 'recipientUserId' | 'recipientCustomerId' | 'recipientRole'> = {
      type: this.batchForm.type as NotificationType,
      title: this.batchForm.subject,
      message: this.batchForm.message,
      deliveryChannels: [this.batchForm.channel as DeliveryChannel],
    };
    const request: BatchNotificationRequest = { userIds, notification };
    this.store.dispatch(sendBatch({ request }));
  }

  onSingleSend(): void {
    const userId = Number(this.singleSendForm.userId);
    const templateCode = this.singleSendForm.templateCode.trim();
    if (!userId || !templateCode) return;
    const request: TemplateNotificationRequest = {
      templateCode,
      userId,
    };
    this.store.dispatch(createFromTemplate({ request }));
  }

  viewDeliveryAttempts(notificationId: number): void {
    this.selectedNotificationId = notificationId;
    this.store.dispatch(loadDeliveryAttempts({ notificationId }));
  }

  getDeliveryChannelLabel(channel: string): string {
    const labels: Record<string, string> = {
      IN_APP: 'In-App',
      EMAIL: 'Email',
      SMS: 'SMS',
    };
    return labels[channel] || channel;
  }

  getDeliveryStatusColor(status: string): string {
    return getDeliveryStatusColor(status);
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

  formatDateTime(dateString: string): string {
    return formatDateTime(dateString);
  }
}