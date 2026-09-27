import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore } from '@ngrx/store/testing';
import { Action } from '@ngrx/store';
import { Subject } from 'rxjs';
import { HeaderComponent } from './header.component';
import { loggedInAuth, pageTestProviders } from '../../../testing/test-helpers';
import { logout } from '../../features/state/auth/auth.actions';
import {
  markAllAsRead,
  mergeNewNotifications,
  refreshNotifications,
} from '../../features/state/notifications/notifications.actions';
import { AuthUser } from '../../core/models/auth-user.model';

type HeaderInternals = {
  initials(user: AuthUser): string;
  roleLabel(role: string | null | undefined): string;
  dashboardPath(user: AuthUser | null): string;
  profilePath(user: AuthUser | null): string;
  notificationsPagePath(user: AuthUser | null): string | null;
  toggleUserMenu(): void;
  toggleMoreMenu(): void;
  closeAllMenus(): void;
  onLogout(): void;
  markAllNotificationsRead(): void;
  refreshNotificationsNow(): void;
  dropdownOpen: boolean;
  moreMenuOpen: boolean;
  bellToast: unknown;
};

function user(role: string, fullName = 'Asha Rao'): AuthUser {
  return { id: 1, fullName, email: 'asha@example.com', role };
}

async function setup(authenticated: boolean) {
  const actions$ = new Subject<Action>();
  await TestBed.configureTestingModule({
    imports: [HeaderComponent],
    providers: [
      ...pageTestProviders(authenticated ? { auth: loggedInAuth('ROLE_CUSTOMER') } : {}),
      provideMockActions(() => actions$),
    ],
  }).compileComponents();

  const store = TestBed.inject(MockStore);
  vi.spyOn(store, 'dispatch');
  const fixture: ComponentFixture<HeaderComponent> = TestBed.createComponent(HeaderComponent);
  fixture.detectChanges();
  const header = fixture.componentInstance as unknown as HeaderInternals;
  return { fixture, header, store, actions$, element: fixture.nativeElement as HTMLElement };
}

describe('HeaderComponent', () => {
  describe('when signed out', () => {
    it('shows sign in and register links', async () => {
      const { element } = await setup(false);

      expect(element.querySelector('a[href="/login"]')).not.toBeNull();
      expect(element.querySelector('a[href="/register"]')).not.toBeNull();
    });
  });

  describe('when signed in', () => {
    it('shows the customer navigation links', async () => {
      const { element } = await setup(true);

      expect(element.querySelector('a[href="/customer/policies"]')).not.toBeNull();
      expect(element.querySelector('a[href="/customer/claims"]')).not.toBeNull();
    });

    it('dispatches logout', async () => {
      const { header, store } = await setup(true);

      header.onLogout();

      expect(store.dispatch).toHaveBeenCalledWith(logout());
    });

    it('dispatches mark-all-read and refresh for notifications', async () => {
      const { header, store } = await setup(true);

      header.markAllNotificationsRead();
      header.refreshNotificationsNow();

      expect(store.dispatch).toHaveBeenCalledWith(markAllAsRead());
      expect(store.dispatch).toHaveBeenCalledWith(refreshNotifications());
    });

    it('shows a bell toast when new notifications arrive', async () => {
      const { header, actions$ } = await setup(true);
      const newest = { id: 2, createdAt: '2026-09-27T10:00:00Z' };

      actions$.next(
        mergeNewNotifications({
          notifications: [{ id: 1, createdAt: '2026-09-26T10:00:00Z' }, newest] as never,
        }),
      );

      expect(header.bellToast).toEqual(newest);
    });
  });

  describe('helpers', () => {
    it('builds initials from the full name or falls back to the email', async () => {
      const { header } = await setup(false);

      expect(header.initials(user('ROLE_CUSTOMER', 'asha devi rao'))).toBe('AD');
      expect(header.initials(user('ROLE_CUSTOMER', ''))).toBe('A');
    });

    it('maps roles to labels and dashboard paths', async () => {
      const { header } = await setup(false);

      expect(header.roleLabel('ROLE_ADMIN')).toBe('Administrator');
      expect(header.roleLabel(null)).toBe('Member');
      expect(header.dashboardPath(user('ROLE_UNDERWRITER'))).toBe('/underwriter/dashboard');
      expect(header.dashboardPath(null)).toBe('/');
    });

    it('sends customers to their profile and staff to their dashboard', async () => {
      const { header } = await setup(false);

      expect(header.profilePath(user('ROLE_CUSTOMER'))).toBe('/customer/profile');
      expect(header.profilePath(user('ROLE_ADMIN'))).toBe('/admin/dashboard');
      expect(header.notificationsPagePath(user('ROLE_CLAIMS_OFFICER'))).toBe('/claims-officer/notifications');
    });

    it('opens one menu at a time and closes all menus', async () => {
      const { header } = await setup(false);

      header.toggleUserMenu();
      expect(header.dropdownOpen).toBe(true);

      header.toggleMoreMenu();
      expect(header.moreMenuOpen).toBe(true);
      expect(header.dropdownOpen).toBe(false);

      header.closeAllMenus();
      expect(header.moreMenuOpen).toBe(false);
    });
  });
});
