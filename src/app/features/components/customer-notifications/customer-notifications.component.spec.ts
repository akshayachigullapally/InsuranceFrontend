import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { CustomerNotificationsComponent } from './customer-notifications.component';
import { loggedInAuth, mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import {
  deleteNotification,
  loadNotifications,
  loadPreferences,
  markAllAsRead,
  markAsRead,
  refreshNotifications,
} from '../../state/notifications/notifications.actions';

async function setup(authenticated: boolean, preferences: unknown[] = []) {
  const root = mockRootState();
  await TestBed.configureTestingModule({
    imports: [CustomerNotificationsComponent],
    providers: pageTestProviders({
      auth: authenticated ? loggedInAuth('ROLE_CUSTOMER') : root.auth,
      notifications: {
        ...root.notifications,
        notifications: [
          { id: 1, title: 'Older', type: 'GENERAL', createdAt: '2026-09-01T00:00:00Z', read: true },
          { id: 2, title: 'Newer', type: 'GENERAL', createdAt: '2026-09-02T00:00:00Z', read: false },
        ],
        preferences,
      },
    }),
  }).compileComponents();

  const store = TestBed.inject(MockStore);
  vi.spyOn(store, 'dispatch');
  const fixture: ComponentFixture<CustomerNotificationsComponent> =
    TestBed.createComponent(CustomerNotificationsComponent);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, store };
}

describe('CustomerNotificationsComponent', () => {
  it('loads notifications and preferences once authenticated', async () => {
    const { store } = await setup(true);

    expect(store.dispatch).toHaveBeenCalledWith(loadNotifications());
    expect(store.dispatch).toHaveBeenCalledWith(loadPreferences());
  });

  it('dispatches read, read-all, refresh and delete actions', async () => {
    const { component, store } = await setup(true);

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
