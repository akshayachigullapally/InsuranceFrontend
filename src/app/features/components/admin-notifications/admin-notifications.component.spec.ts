import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { AdminNotificationsComponent } from './admin-notifications.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { loadAllNotifications } from '../../state/notifications/notifications.actions';
import { NotificationService } from '../../services/notification.service';
import { of } from 'rxjs';
import { NotificationResponse } from '../../dtos/notifications/notification-response.dto';

const notifications = [
  { id: 1, title: 'Policy Pending Review', message: 'Policy POL-1 awaits review', type: 'POLICY_SUBMITTED',
    recipientRole: 'ROLE_ADMIN', read: false, createdAt: '2026-09-27T10:00:00', deliveryChannel: 'IN_APP' },
  { id: 2, title: 'Claim Approved', message: 'Your claim CLM-9 was approved', type: 'CLAIM_APPROVED',
    recipientUserId: 42, read: true, createdAt: '2026-09-26T10:00:00', deliveryChannel: 'EMAIL' },
] as unknown as NotificationResponse[];

describe('AdminNotificationsComponent', () => {
  let fixture: ComponentFixture<AdminNotificationsComponent>;
  let store: MockStore;
  const notificationService = {
    adminMarkAsRead: vi.fn().mockReturnValue(of({})),
    adminDelete: vi.fn().mockReturnValue(of({ message: 'Notification deleted' })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminNotificationsComponent],
      providers: [
        ...pageTestProviders({
          notifications: { ...mockRootState().notifications, adminNotifications: notifications },
        }),
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(AdminNotificationsComponent);
    fixture.detectChanges();
  });

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  it('loads all notifications on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(loadAllNotifications());
  });

  it('lists notifications with their recipient', () => {
    expect(text()).toContain('Policy Pending Review');
    expect(text()).toContain('All admins');
    expect(text()).toContain('User #42');
  });

  const buttons = (label: string) => Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(`button[aria-label="${label}"]`),
  );

  it('offers mark-as-read only for unread notifications and delete for all', () => {
    expect(buttons('Mark as read')).toHaveLength(1);
    expect(buttons('Delete')).toHaveLength(2);
  });

  it('marks a notification as read and reloads the list', () => {
    vi.mocked(store.dispatch).mockClear();
    buttons('Mark as read')[0].click();

    expect(notificationService.adminMarkAsRead).toHaveBeenCalledWith(1);
    expect(store.dispatch).toHaveBeenCalledWith(loadAllNotifications());
  });

  it('asks before deleting, then deletes', () => {
    buttons('Delete')[1].click();
    fixture.detectChanges();
    expect(text()).toContain('Delete this notification?');

    (fixture.componentInstance as unknown as { confirmDelete(): void }).confirmDelete();

    expect(notificationService.adminDelete).toHaveBeenCalledWith(2);
  });

  it('has no templates, batch send, failed deliveries or channel column', () => {
    expect(text()).not.toContain('Templates');
    expect(text()).not.toContain('Batch');
    expect(text()).not.toContain('Failed Deliveries');
    expect(text()).not.toContain('Channel');
    expect(text()).not.toContain('EMAIL');
  });

  it('filters by search text', () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'claim';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(text()).toContain('Claim Approved');
    expect(text()).not.toContain('Policy Pending Review');
  });
});
