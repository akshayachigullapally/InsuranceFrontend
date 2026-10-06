import { Injectable, NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../../core/services/token-storage.service';
import * as NotificationsActions from '../state/notifications/notifications.actions';

/** Wait before reconnecting: 5 s, then 10 s, 20 s … up to 60 s between attempts. */
const RECONNECT_BASE_MS = 5_000;
const RECONNECT_MAX_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class NotificationPushService {
  private es: EventSource | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private failures = 0;
  /** True between connect() and disconnect(); a dropped stream is only reopened while true. */
  private wanted = false;

  constructor(
    private readonly store: Store,
    private readonly tokenStorage: TokenStorageService,
    private readonly ngZone: NgZone,
  ) {}

  connect() {
    this.wanted = true;
    this.open();
  }

  disconnect() {
    this.wanted = false;
    this.failures = 0;
    this.clearReconnect();
    this.close();
  }

  private open() {
    if (this.es || !this.wanted) return;
    // A fresh token every time: the one used by a dropped stream may have expired.
    const token = this.tokenStorage.getAccessToken();
    const url = `${environment.apiUrl}/api/notifications/me/stream${token ? `?access_token=${encodeURIComponent(token)}` : ''}`;
    this.es = new EventSource(url);

    this.es.onopen = () => {
      this.failures = 0;
    };

    this.es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        // dispatch merge action inside Angular zone
        this.ngZone.run(() => {
          this.store.dispatch(
            NotificationsActions.mergeNewNotifications({ notifications: [payload] }),
          );
        });
      } catch (e) {
        // ignore
      }
    };

    // The service may be restarting or the token may have expired: close this stream
    // and try again later instead of giving up for good.
    this.es.onerror = () => {
      this.close();
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (!this.wanted || this.reconnectTimer) return;
    const delay = Math.min(RECONNECT_BASE_MS * 2 ** this.failures, RECONNECT_MAX_MS);
    this.failures++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.open();
    }, delay);
  }

  private clearReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private close() {
    if (!this.es) return;
    try {
      this.es.close();
    } catch (e) {}
    this.es = null;
  }
}
