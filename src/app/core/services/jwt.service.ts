import { Injectable } from '@angular/core';
import { JwtClaims } from '../models/jwt-claims.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class JwtService {
  constructor(private readonly tokenStorage: TokenStorageService) {}

  decodeToken(token: string): JwtClaims | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join(''),
      );
      return JSON.parse(payload) as JwtClaims;
    } catch {
      return null;
    }
  }

  getAccessTokenClaims(): JwtClaims | null {
    const token = this.tokenStorage.getAccessToken();
    return token ? this.decodeToken(token) : null;
  }

  getRole(): string | null {
    return this.getAccessTokenClaims()?.role ?? null;
  }

  getCustomerId(): number | undefined {
    return this.getAccessTokenClaims()?.customerId;
  }

  isTokenExpired(token: string): boolean {
    const claims = this.decodeToken(token);
    if (!claims || !claims.exp) {
      return true;
    }
    const nowSeconds = Math.floor(Date.now() / 1000);
    return claims.exp <= nowSeconds;
  }
}