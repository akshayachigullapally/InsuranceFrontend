import { TestBed } from '@angular/core/testing';
import { JwtService } from './jwt.service';
import { TokenStorageService } from './token-storage.service';

function base64Url(value: object): string {
  return btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function makeToken(payload: object): string {
  return `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url(payload)}.signature`;
}

describe('JwtService', () => {
  let service: JwtService;
  let accessToken: string | null;

  beforeEach(() => {
    accessToken = null;
    TestBed.configureTestingModule({
      providers: [
        { provide: TokenStorageService, useValue: { getAccessToken: () => accessToken } },
      ],
    });
    service = TestBed.inject(JwtService);
  });

  it('decodes the payload of a valid token', () => {
    const token = makeToken({ sub: '1', email: 'asha@example.com', role: 'CUSTOMER', customerId: 7 });

    expect(service.decodeToken(token)).toEqual({
      sub: '1',
      email: 'asha@example.com',
      role: 'CUSTOMER',
      customerId: 7,
    });
  });

  it('returns null for malformed tokens', () => {
    expect(service.decodeToken('not-a-jwt')).toBeNull();
    expect(service.decodeToken('a.%%%invalid%%%.c')).toBeNull();
  });

  it('reads role and customerId from the stored access token', () => {
    accessToken = makeToken({ sub: '1', email: 'a@b.com', role: 'ADMIN', customerId: 3 });

    expect(service.getRole()).toBe('ADMIN');
    expect(service.getCustomerId()).toBe(3);
  });

  it('returns null claims when no token is stored', () => {
    expect(service.getAccessTokenClaims()).toBeNull();
    expect(service.getRole()).toBeNull();
    expect(service.getCustomerId()).toBeUndefined();
  });

  it('detects expired and valid tokens', () => {
    const now = Math.floor(Date.now() / 1000);

    expect(service.isTokenExpired(makeToken({ exp: now - 60 }))).toBe(true);
    expect(service.isTokenExpired(makeToken({ exp: now + 3600 }))).toBe(false);
  });

  it('treats tokens without exp or invalid tokens as expired', () => {
    expect(service.isTokenExpired(makeToken({ sub: '1' }))).toBe(true);
    expect(service.isTokenExpired('garbage')).toBe(true);
  });
});
