import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  updateAccessToken(accessToken: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  }

  updateRefreshToken(refreshToken: string): void {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  /** True when the access token's expiry (exp claim) is within the next 30 seconds. */
  isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const exp = (JSON.parse(atob(payload)) as { exp?: number }).exp;
      return typeof exp === 'number' && exp * 1000 < Date.now() + 30_000;
    } catch {
      return false;
    }
  }

  hasTokens(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  }

  hasAnyToken(): boolean {
    return !!this.getAccessToken() || !!this.getRefreshToken();
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }
}