import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { NotificationPushService } from './notification-push.service';
import { of } from 'rxjs';
import { TokenStorageService } from '../../core/services/token-storage.service';
import { AuthService } from './auth.service';
import * as NotificationsActions from '../state/notifications/notifications.actions';

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onopen: ((event: unknown) => void) | null = null;
  close = vi.fn();

  constructor(public readonly url: string) {
    FakeEventSource.instances.push(this);
  }
}

describe('NotificationPushService', () => {
  let service: NotificationPushService;
  let store: MockStore;
  let accessToken: string | null;
  let expired: boolean;
  const refresh = vi.fn();

  beforeEach(() => {
    FakeEventSource.instances = [];
    accessToken = 'abc 123';
    expired = false;
    refresh.mockReset();
    vi.stubGlobal('EventSource', FakeEventSource);

    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        {
          provide: TokenStorageService,
          useValue: {
            getAccessToken: () => accessToken,
            getRefreshToken: () => 'refresh-1',
            isAccessTokenExpired: () => expired,
            storeTokens: (access: string) => (accessToken = access),
          },
        },
        { provide: AuthService, useValue: { refresh } },
      ],
    });
    service = TestBed.inject(NotificationPushService);
    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
  });

  afterEach(() => {
    service.disconnect();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('opens a stream with the encoded access token', () => {
    service.connect();

    expect(FakeEventSource.instances.length).toBe(1);
    expect(FakeEventSource.instances[0].url).toContain(
      '/api/notifications/me/stream?access_token=abc%20123',
    );
  });

  it('dispatches incoming notifications to the store', () => {
    service.connect();
    const payload = { id: 5, title: 'Claim approved' };

    FakeEventSource.instances[0].onmessage?.({ data: JSON.stringify(payload) });

    expect(store.dispatch).toHaveBeenCalledWith(
      NotificationsActions.mergeNewNotifications({ notifications: [payload as never] }),
    );
  });

  it('reconnects by itself after an error, with a fresh token', () => {
    vi.useFakeTimers();
    service.connect();
    accessToken = 'new-token';

    FakeEventSource.instances[0].onerror?.(new Event('error'));
    expect(FakeEventSource.instances.length).toBe(1);

    vi.advanceTimersByTime(5_000);
    expect(FakeEventSource.instances.length).toBe(2);
    expect(FakeEventSource.instances[1].url).toContain('access_token=new-token');
  });

  it('waits longer after each failed attempt, up to a minute', () => {
    vi.useFakeTimers();
    service.connect();

    FakeEventSource.instances[0].onerror?.(new Event('error'));
    vi.advanceTimersByTime(5_000);
    FakeEventSource.instances[1].onerror?.(new Event('error'));
    vi.advanceTimersByTime(9_999);
    expect(FakeEventSource.instances.length).toBe(2);
    vi.advanceTimersByTime(1);
    expect(FakeEventSource.instances.length).toBe(3);

    // A successful connection resets the wait.
    FakeEventSource.instances[2].onopen?.(new Event('open'));
    FakeEventSource.instances[2].onerror?.(new Event('error'));
    vi.advanceTimersByTime(5_000);
    expect(FakeEventSource.instances.length).toBe(4);
  });

  it('refreshes an expired token before opening the stream', () => {
    expired = true;
    refresh.mockReturnValue(of({ accessToken: 'fresh', refreshToken: 'refresh-2' }));

    service.connect();

    expect(refresh).toHaveBeenCalledWith({ refreshToken: 'refresh-1' });
    expect(FakeEventSource.instances.length).toBe(1);
    expect(FakeEventSource.instances[0].url).toContain('access_token=fresh');
  });
});
