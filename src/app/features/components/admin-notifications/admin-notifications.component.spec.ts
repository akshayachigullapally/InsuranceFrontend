import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { AdminNotificationsComponent } from './admin-notifications.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { loadAllNotifications } from '../../state/notifications/notifications.actions';
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminNotificationsComponent],
      providers: pageTestProviders({
        notifications: { ...mockRootState().notifications, adminNotifications: notifications },
      }),
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

  it('lists notifications with their recipient and read state', () => {
    expect(text()).toContain('Policy Pending Review');
    expect(text()).toContain('All admins');
    expect(text()).toContain('User #42');
    expect(text()).toContain('Unread');
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
