import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { AdminNotificationsComponent } from './admin-notifications.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import {
  createFromTemplate,
  createTemplate,
  deactivateTemplate,
  loadAllNotifications,
  loadDeliveryAttempts,
  loadFailedNotifications,
  loadTemplates,
  sendBatch,
  updateTemplate,
} from '../../state/notifications/notifications.actions';
import { NotificationTemplateResponse } from '../../dtos/notifications/notification-response.dto';

describe('AdminNotificationsComponent', () => {
  let fixture: ComponentFixture<AdminNotificationsComponent>;
  let component: AdminNotificationsComponent;
  let store: MockStore;
  const template = {
    id: 3,
    templateCode: 'CLAIM_APPROVED',
    notificationType: 'CLAIM_UPDATE',
    titleTemplate: 'Claim approved',
    messageTemplate: 'Your claim {{claimNumber}} was approved',
    defaultChannel: 'EMAIL',
    active: true,
  } as unknown as NotificationTemplateResponse;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminNotificationsComponent],
      providers: pageTestProviders(),
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(AdminNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads all notifications on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(loadAllNotifications());
  });

  it('loads the right data when switching tabs', () => {
    component.switchTab('failed');
    expect(store.dispatch).toHaveBeenCalledWith(loadFailedNotifications());

    component.switchTab('templates');
    expect(store.dispatch).toHaveBeenCalledWith(loadTemplates());
    expect(component.activeTab).toBe('templates');
  });

  it('creates a new template', () => {
    component.openCreateTemplate();
    component.templateForm = { ...component.templateForm, templateCode: 'WELCOME', titleTemplate: 'Hi', messageTemplate: 'Welcome!' };

    component.saveTemplate();

    expect(store.dispatch).toHaveBeenCalledWith(
      createTemplate({
        request: {
          templateCode: 'WELCOME',
          notificationType: 'GENERAL',
          titleTemplate: 'Hi',
          messageTemplate: 'Welcome!',
          defaultChannel: 'IN_APP',
        } as never,
      }),
    );
    expect(component.showTemplateForm).toBe(false);
  });

  it('updates an edited template', () => {
    component.openEditTemplate(template);
    expect(component.templateForm.templateCode).toBe('CLAIM_APPROVED');

    component.saveTemplate();

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: updateTemplate.type, templateId: 3 }),
    );
  });

  it('deactivates only active templates', () => {
    component.toggleTemplateActive(template);
    expect(store.dispatch).toHaveBeenCalledWith(deactivateTemplate({ templateId: 3 }));

    vi.mocked(store.dispatch).mockClear();
    component.toggleTemplateActive({ ...template, active: false });
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('sends a batch to the parsed user ids', () => {
    component.batchForm = { userIds: '1, 2,,3 ', subject: 'Heads up', message: 'Heavy rain', type: 'GENERAL', channel: 'SMS' };

    component.onBatchSubmit();

    expect(store.dispatch).toHaveBeenCalledWith(
      sendBatch({
        request: {
          userIds: [1, 2, 3],
          notification: { type: 'GENERAL', title: 'Heads up', message: 'Heavy rain', deliveryChannels: ['SMS'] },
        } as never,
      }),
    );
  });

  it('skips the batch when no user ids are given', () => {
    vi.mocked(store.dispatch).mockClear();
    component.batchForm = { ...component.batchForm, userIds: ' , ' };

    component.onBatchSubmit();

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('sends a single templated notification only with a user and template', () => {
    vi.mocked(store.dispatch).mockClear();
    component.singleSendForm = { userId: '', templateCode: 'WELCOME' };
    component.onSingleSend();
    expect(store.dispatch).not.toHaveBeenCalled();

    component.singleSendForm = { userId: '7', templateCode: 'WELCOME' };
    component.onSingleSend();
    expect(store.dispatch).toHaveBeenCalledWith(
      createFromTemplate({ request: { templateCode: 'WELCOME', userId: 7 } as never }),
    );
  });

  it('loads delivery attempts for a notification', () => {
    component.viewDeliveryAttempts(11);

    expect(component.selectedNotificationId).toBe(11);
    expect(store.dispatch).toHaveBeenCalledWith(loadDeliveryAttempts({ notificationId: 11 }));
  });

  it('labels delivery channels', () => {
    expect(component.getDeliveryChannelLabel('IN_APP')).toBe('In-App');
    expect(component.getDeliveryChannelLabel('PUSH')).toBe('PUSH');
  });
});
