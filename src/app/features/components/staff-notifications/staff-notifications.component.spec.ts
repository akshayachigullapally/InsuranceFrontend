import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { StaffNotificationsComponent } from './staff-notifications.component';
import { loggedInAuth, mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import {
  deleteNotification,
  loadNotifications,
  markAllAsRead,
  markAsRead,
  refreshNotifications,
} from '../../state/notifications/notifications.actions';

describe('StaffNotificationsComponent', () => {
  let fixture: ComponentFixture<StaffNotificationsComponent>;
  let component: StaffNotificationsComponent;
  let store: MockStore;

  beforeEach(async () => {
    const root = mockRootState();
    await TestBed.configureTestingModule({
      imports: [StaffNotificationsComponent],
      providers: pageTestProviders({
        auth: loggedInAuth('ROLE_ADMIN'),
        notifications: {
          ...root.notifications,
          notifications: [
            { id: 1, title: 'First', type: 'GENERAL', createdAt: '2026-09-01T00:00:00Z', read: true },
            { id: 2, title: 'Second', type: 'GENERAL', createdAt: '2026-09-03T00:00:00Z', read: false },
          ],
        },
      }),
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(StaffNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads notifications once authenticated', () => {
    expect(store.dispatch).toHaveBeenCalledWith(loadNotifications());
  });

  it('dispatches notification actions', () => {
    component.markAsRead(2);
    component.markAllAsRead();
    component.refresh();
    component.deleteNotification(1);

    expect(store.dispatch).toHaveBeenCalledWith(markAsRead({ notificationId: 2 }));
    expect(store.dispatch).toHaveBeenCalledWith(markAllAsRead());
    expect(store.dispatch).toHaveBeenCalledWith(refreshNotifications());
    expect(store.dispatch).toHaveBeenCalledWith(deleteNotification({ notificationId: 1 }));
  });
});
