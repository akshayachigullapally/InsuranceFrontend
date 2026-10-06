import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { NotificationPushService } from './notification-push.service';
import { TokenStorageService } from '../../core/services/token-storage.service';
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

  beforeEach(() => {
    FakeEventSource.instances = [];
    accessToken = 'abc 123';
    vi.stubGlobal('EventSource', FakeEventSource);

    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        { provide: TokenStorageService, useValue: { getAccessToken: () => accessToken } },
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

  it('opens a stream without a token query when not logged in', () => {
    accessToken = null;

    service.connect();

    expect(FakeEventSource.instances[0].url).toMatch(/\/api\/notifications\/me\/stream$/);
  });

  it('does not open a second stream when already connected', () => {
    service.connect();
    service.connect();

    expect(FakeEventSource.instances.length).toBe(1);
  });

  it('dispatches incoming notifications to the store', () => {
    service.connect();
    const payload = { id: 5, title: 'Claim approved' };

    FakeEventSource.instances[0].onmessage?.({ data: JSON.stringify(payload) });

    expect(store.dispatch).toHaveBeenCalledWith(
      NotificationsActions.mergeNewNotifications({ notifications: [payload as never] }),
    );
  });

  it('ignores messages that are not valid JSON', () => {
    service.connect();

    FakeEventSource.instances[0].onmessage?.({ data: 'not json' });

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('closes the stream on error so it can reconnect later', () => {
    service.connect();
    const first = FakeEventSource.instances[0];

    first.onerror?.(new Event('error'));
    service.connect();

    expect(first.close).toHaveBeenCalled();
    expect(FakeEventSource.instances.length).toBe(2);
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

  it('does not reconnect after disconnect (logout)', () => {
    vi.useFakeTimers();
    service.connect();
    FakeEventSource.instances[0].onerror?.(new Event('error'));

    service.disconnect();
    vi.advanceTimersByTime(60_000);

    expect(FakeEventSource.instances.length).toBe(1);
  });

  it('disconnect is a no-op when not connected', () => {
    expect(() => service.disconnect()).not.toThrow();
  });
});
