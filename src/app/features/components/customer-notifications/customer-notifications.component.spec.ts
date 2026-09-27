import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { firstValueFrom } from 'rxjs';
import { CustomerNotificationsComponent } from './customer-notifications.component';
import { loggedInAuth, mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import {
  deleteNotification,
  loadNotifications,
  loadPreferences,
  markAllAsRead,
  markAsRead,
  refreshNotifications,
  upsertPreference,
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

  it('does not load anything while signed out', async () => {
    const { store } = await setup(false);

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('sorts notifications newest first', async () => {
    const { component } = await setup(true);

    const sorted = await firstValueFrom(component.sortedNotifications$);

    expect(sorted.map((notification) => notification.id)).toEqual([2, 1]);
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

  it('treats channels as enabled when there is no saved preference', async () => {
    const { component } = await setup(true);

    expect(component.isChannelEnabled('GENERAL' as never, 'emailEnabled')).toBe(true);
  });

  it('toggles a channel off based on the saved preference', async () => {
    const { component, store } = await setup(true, [
      { notificationType: 'GENERAL', inAppEnabled: true, emailEnabled: true, smsEnabled: false },
    ]);

    component.togglePreference('GENERAL' as never, 'emailEnabled');

    expect(store.dispatch).toHaveBeenCalledWith(
      upsertPreference({ request: { notificationType: 'GENERAL', emailEnabled: false } as never }),
    );
  });
});
