import { Injectable, NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../../core/services/token-storage.service';
import * as NotificationsActions from '../state/notifications/notifications.actions';

@Injectable({ providedIn: 'root' })
export class NotificationPushService {
  private es: EventSource | null = null;

  constructor(
    private readonly store: Store,
    private readonly tokenStorage: TokenStorageService,
    private readonly ngZone: NgZone,
  ) {}

  connect() {
    if (this.es) return;
    const token = this.tokenStorage.getAccessToken();
    const url = `${environment.apiUrl}/api/notifications/me/stream${token ? `?access_token=${encodeURIComponent(token)}` : ''}`;
    this.es = new EventSource(url);

    this.es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        // dispatch merge action inside Angular zone
        this.ngZone.run(() => {
          this.store.dispatch(NotificationsActions.mergeNewNotifications({ notifications: [payload] }));
        });
      } catch (e) {
        // ignore
      }
    };

    this.es.onerror = (err) => {
      this.disconnect();
    };
  }

  disconnect() {
    if (!this.es) return;
    try {
      this.es.close();
    } catch (e) {
    }
    this.es = null;
  }
}
