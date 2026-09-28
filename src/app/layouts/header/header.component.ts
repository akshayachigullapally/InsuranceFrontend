import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Observable, Subject, map, takeUntil, fromEvent, filter } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { selectIsAuthenticated, selectAuthUser } from '../../features/state/auth/auth.selectors';
import { logout } from '../../features/state/auth/auth.actions';
import {
  selectUnreadCount,
  selectLatestNotifications,
  selectNotificationsRefreshing,
  selectNotificationsError,
} from '../../features/state/notifications/notifications.selectors';
import {
  markAsRead,
  markAllAsRead,
  refreshNotifications,
  mergeNewNotifications,
  deleteNotification,
} from '../../features/state/notifications/notifications.actions';
import { AuthUser } from '../../core/models/auth-user.model';
import { ROLE_LABELS, UserRole, ROLES } from '../../core/constants/roles';
import {
  ROLE_PRIMARY_NAV,
  ROLE_MORE_MENU,
  HeaderMoreGroup,
  HeaderNavLink,
} from './header-nav-links';
import { MeasurementThresholdsComponent } from '../../shared/components/measurement-thresholds/measurement-thresholds.component';
import { NotificationResponse } from '../../features/dtos/notifications/notification-response.dto';
import {
  formatTimeAgo,
  getNotificationIcon,
  notificationDestinationRoute,
} from '../../features/utils/notification-utils';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, AsyncPipe, MeasurementThresholdsComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewChecked {
  readonly isAuthenticated$: Observable<boolean>;
  readonly user$: Observable<AuthUser | null>;
  protected readonly unreadCount$: Observable<number>;
  protected readonly latestNotifications$: Observable<NotificationResponse[]>;
  protected readonly notificationsRefreshing$: Observable<boolean>;
  protected readonly notificationsError$: Observable<string | null>;
  protected readonly ROLES = ROLES;
  protected dropdownOpen = false;
  protected moreMenuOpen = false;
  protected mobileMenuOpen = false;
  protected thresholdsOpen = false;
  protected notificationsMenuOpen = false;
  protected bellToast: NotificationResponse | null = null;
  private bellToastTimer: ReturnType<typeof setTimeout> | null = null;
  protected primaryNav$: Observable<HeaderNavLink[]> = new Observable();
  protected moreGroups$: Observable<HeaderMoreGroup[]> = new Observable();
  protected activeRoute = '';
  @ViewChild('moreMenuPanel') moreMenuPanel!: ElementRef<HTMLDivElement>;
  @ViewChild('userMenuPanel') userMenuPanel!: ElementRef<HTMLDivElement>;
  @ViewChild('notificationsMenuPanel') notificationsMenuPanel!: ElementRef<HTMLDivElement>;
  private readonly destroy$ = new Subject<void>();
  private focusAfterOpen = false;
  private focusTarget: 'more' | 'user' | 'notifications' | null = null;
  constructor(
    private readonly store: Store,
    private readonly router: Router,
    private readonly actions$: Actions,
  ) {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.user$ = this.store.select(selectAuthUser);
    this.unreadCount$ = this.store.select(selectUnreadCount);
    this.latestNotifications$ = this.store.select(selectLatestNotifications);
    this.notificationsRefreshing$ = this.store.select(selectNotificationsRefreshing);
    this.notificationsError$ = this.store.select(selectNotificationsError);
    this.primaryNav$ = this.user$.pipe(
      map((user) => {
        if (!user?.role) return [];
        return ROLE_PRIMARY_NAV[user.role] ?? [];
      }),
    );
    this.moreGroups$ = this.user$.pipe(
      map((user) => {
        if (!user?.role) return [];
        return ROLE_MORE_MENU[user.role] ?? [];
      }),
    );
  }
  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((e) => {
        this.activeRoute = e.urlAfterRedirects;
        this.closeAllMenus();
      });
    fromEvent<MouseEvent>(document, 'click')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => this.onDocumentClick(event));
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => this.onGlobalKeydown(event));
    this.actions$
      .pipe(ofType(mergeNewNotifications), takeUntil(this.destroy$))
      .subscribe(({ notifications }) => {
        const latest = notifications.reduce<NotificationResponse | null>(
          (newest, candidate) =>
            !newest ||
            new Date(candidate.createdAt).getTime() > new Date(newest.createdAt).getTime()
              ? candidate
              : newest,
          null,
        );
        if (latest) {
          this.showBellToast(latest);
        }
      });
  }
  ngAfterViewChecked(): void {
    if (this.focusAfterOpen) {
      this.focusAfterOpen = false;
      if (this.focusTarget === 'more' && this.moreMenuPanel) {
        const firstLink = this.moreMenuPanel.nativeElement.querySelector(
          'a[href], button',
        ) as HTMLElement;
        firstLink?.focus();
      } else if (this.focusTarget === 'user' && this.userMenuPanel) {
        const firstLink = this.userMenuPanel.nativeElement.querySelector(
          'a[href], button',
        ) as HTMLElement;
        firstLink?.focus();
      } else if (this.focusTarget === 'notifications' && this.notificationsMenuPanel) {
        const firstLink = this.notificationsMenuPanel.nativeElement.querySelector(
          'a[href], button',
        ) as HTMLElement;
        firstLink?.focus();
      }
      this.focusTarget = null;
    }
  }
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.moreMenuOpen) {
      const trigger = document.querySelector(
        '.header-dropdown:has(#more-menu-panel) .header-dropdown-trigger',
      ) as HTMLElement;
      const panel = this.moreMenuPanel?.nativeElement;
      if (trigger && panel && !trigger.contains(target) && !panel.contains(target)) {
        this.moreMenuOpen = false;
      }
    }
    if (this.dropdownOpen) {
      const trigger = document.querySelector(
        '.header-dropdown:has(#user-menu-panel) .header-user-trigger',
      ) as HTMLElement;
      const panel = this.userMenuPanel?.nativeElement;
      if (trigger && panel && !trigger.contains(target) && !panel.contains(target)) {
        this.dropdownOpen = false;
      }
    }
    if (this.notificationsMenuOpen) {
      const trigger = document.querySelector(
        '.header-dropdown:has(#notifications-menu-panel) .header-notifications-trigger',
      ) as HTMLElement;
      const panel = this.notificationsMenuPanel?.nativeElement;
      if (trigger && panel && !trigger.contains(target) && !panel.contains(target)) {
        this.notificationsMenuOpen = false;
      }
    }
  }
  protected onGlobalKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeAllMenus();
    }
  }
  protected onMoreMenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.moreMenuOpen = false;
      const trigger = document.querySelector(
        '.header-dropdown:has(#more-menu-panel) .header-dropdown-trigger',
      ) as HTMLElement;
      trigger?.focus();
    } else if (event.key === 'ArrowDown' && !this.moreMenuOpen) {
      event.preventDefault();
      this.openMoreMenu();
    } else if (event.key === 'Tab' && this.moreMenuOpen) {
      this.handleTabInMenu(event, this.moreMenuPanel);
    }
  }
  protected onUserMenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.dropdownOpen = false;
      const trigger = document.querySelector(
        '.header-dropdown:has(#user-menu-panel) .header-user-trigger',
      ) as HTMLElement;
      trigger?.focus();
    } else if (event.key === 'ArrowDown' && !this.dropdownOpen) {
      event.preventDefault();
      this.openUserMenu();
    } else if (event.key === 'Tab' && this.dropdownOpen) {
      this.handleTabInMenu(event, this.userMenuPanel);
    }
  }
  protected onNotificationsMenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.notificationsMenuOpen = false;
      const trigger = document.querySelector(
        '.header-dropdown:has(#notifications-menu-panel) .header-notifications-trigger',
      ) as HTMLElement;
      trigger?.focus();
    } else if (event.key === 'ArrowDown' && !this.notificationsMenuOpen) {
      event.preventDefault();
      this.openNotificationsMenu();
    } else if (event.key === 'Tab' && this.notificationsMenuOpen) {
      this.handleTabInMenu(event, this.notificationsMenuPanel);
    }
  }
  private handleTabInMenu(
    event: KeyboardEvent,
    panelRef: ElementRef<HTMLDivElement> | undefined,
  ): void {
    if (!panelRef) return;
    const focusableElements = panelRef.nativeElement.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusableElements.length === 0) return;
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;
    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
  protected openMoreMenu(): void {
    this.closeAllMenus();
    this.moreMenuOpen = true;
    this.focusAfterOpen = true;
    this.focusTarget = 'more';
  }
  protected openUserMenu(): void {
    this.closeAllMenus();
    this.dropdownOpen = true;
    this.focusAfterOpen = true;
    this.focusTarget = 'user';
  }
  protected openNotificationsMenu(): void {
    this.closeAllMenus();
    this.notificationsMenuOpen = true;
    this.focusAfterOpen = true;
    this.focusTarget = 'notifications';
  }
  protected toggleMoreMenu(): void {
    if (this.moreMenuOpen) {
      this.moreMenuOpen = false;
    } else {
      this.openMoreMenu();
    }
  }
  protected toggleUserMenu(): void {
    if (this.dropdownOpen) {
      this.dropdownOpen = false;
    } else {
      this.openUserMenu();
    }
  }
  protected toggleNotificationsMenu(): void {
    if (this.notificationsMenuOpen) {
      this.notificationsMenuOpen = false;
    } else {
      this.openNotificationsMenu();
    }
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.bellToastTimer) {
      clearTimeout(this.bellToastTimer);
    }
  }
  protected closeAllMenus(): void {
    this.dropdownOpen = false;
    this.moreMenuOpen = false;
    this.mobileMenuOpen = false;
    this.notificationsMenuOpen = false;
  }
  protected onNavClick(): void {
    this.mobileMenuOpen = false;
  }
  protected onMenuItemClick(): void {
    this.moreMenuOpen = false;
    this.dropdownOpen = false;
    this.notificationsMenuOpen = false;
  }
  protected toggleThresholds(): void {
    this.thresholdsOpen = !this.thresholdsOpen;
  }
  protected closeThresholds(): void {
    this.thresholdsOpen = false;
  }
  protected dashboardPath(user: AuthUser | null): string {
    if (!user?.role) return '/';
    const paths: Record<string, string> = {
      [ROLES.CUSTOMER]: '/customer/dashboard',
      [ROLES.UNDERWRITER]: '/underwriter/dashboard',
      [ROLES.CLAIMS_OFFICER]: '/claims-officer/dashboard',
      [ROLES.ADMIN]: '/admin/dashboard',
    };
    return paths[user.role] ?? '/';
  }
  protected profilePath(user: AuthUser | null): string {
    if (!user?.role) return '/';
    if (user.role === ROLES.CUSTOMER) return '/customer/profile';
    return this.dashboardPath(user);
  }
  protected initials(user: AuthUser): string {
    if (!user?.fullName) {
      return user?.email?.charAt(0)?.toUpperCase() ?? 'C';
    }
    return user.fullName
      .split(' ')
      .map((p) => p.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  protected roleLabel(role: string | null | undefined): string {
    return role && ROLE_LABELS[role as UserRole] ? ROLE_LABELS[role as UserRole] : 'Member';
  }
  protected onLogout(): void {
    this.dropdownOpen = false;
    this.mobileMenuOpen = false;
    this.notificationsMenuOpen = false;
    this.store.dispatch(logout());
  }
  protected isActiveRoute(route: string): boolean {
    return this.activeRoute === route || this.activeRoute.startsWith(route + '/');
  }
  protected notificationsIcon(type: string): string {
    return getNotificationIcon(type);
  }
  protected timeAgo(createdAt: string): string {
    return formatTimeAgo(createdAt);
  }
  protected notificationsPagePath(user: AuthUser | null): string | null {
    if (!user?.role) return null;
    const paths: Record<string, string> = {
      [ROLES.CUSTOMER]: '/customer/notifications',
      [ROLES.UNDERWRITER]: '/underwriter/notifications',
      [ROLES.CLAIMS_OFFICER]: '/claims-officer/notifications',
      [ROLES.ADMIN]: '/admin/notifications',
    };
    return paths[user.role] ?? null;
  }
  protected deleteNotificationItem(event: Event, notification: NotificationResponse): void {
    event.stopPropagation();
    event.preventDefault();
    this.store.dispatch(deleteNotification({ notificationId: notification.id }));
    if (this.bellToast && this.bellToast.id === notification.id) {
      this.dismissBellToast();
    }
  }
  protected notificationLink(
    notification: NotificationResponse,
    user: AuthUser | null,
  ): string | null {
    return notificationDestinationRoute(notification, user?.role ?? null);
  }
  protected onNotificationClick(notification: NotificationResponse): void {
    this.notificationsMenuOpen = false;
    if (this.bellToast && this.bellToast.id === notification.id) {
      this.dismissBellToast();
    }
    if (!notification.read) {
      this.store.dispatch(markAsRead({ notificationId: notification.id }));
    }
  }
  protected markAllNotificationsRead(): void {
    this.store.dispatch(markAllAsRead());
  }
  protected refreshNotificationsNow(): void {
    this.store.dispatch(refreshNotifications());
  }
  protected dismissBellToast(): void {
    if (this.bellToastTimer) {
      clearTimeout(this.bellToastTimer);
      this.bellToastTimer = null;
    }
    this.bellToast = null;
  }
  private showBellToast(notification: NotificationResponse): void {
    this.bellToast = notification;
    if (this.bellToastTimer) {
      clearTimeout(this.bellToastTimer);
    }
    this.bellToastTimer = setTimeout(() => {
      this.bellToast = null;
      this.bellToastTimer = null;
    }, 5000);
  }
}
