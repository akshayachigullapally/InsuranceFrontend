import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { NotificationPushService } from './notification-push.service';
import { TokenStorageService } from '../../core/services/token-storage.service';
import * as NotificationsActions from '../state/notifications/notifications.actions';

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
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

  it('disconnect is a no-op when not connected', () => {
    expect(() => service.disconnect()).not.toThrow();
  });
});
