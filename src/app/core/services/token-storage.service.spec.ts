import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from './token-storage.service';
import { STORAGE_KEYS } from '../constants/storage-keys';

describe('TokenStorageService', () => {
  let service: TokenStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenStorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns null when nothing is stored', () => {
    expect(service.getAccessToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
    expect(service.hasTokens()).toBe(false);
    expect(service.hasAnyToken()).toBe(false);
  });

  it('stores both tokens under the expected keys', () => {
    service.storeTokens('access-1', 'refresh-1');

    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe('access-1');
    expect(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBe('refresh-1');
    expect(service.hasTokens()).toBe(true);
  });

  it('updates each token independently', () => {
    service.storeTokens('access-1', 'refresh-1');

    service.updateAccessToken('access-2');
    service.updateRefreshToken('refresh-2');

    expect(service.getAccessToken()).toBe('access-2');
    expect(service.getRefreshToken()).toBe('refresh-2');
  });

  it('reports hasAnyToken when only one token exists', () => {
    service.updateRefreshToken('refresh-only');

    expect(service.hasTokens()).toBe(false);
    expect(service.hasAnyToken()).toBe(true);
  });

  it('clears both tokens', () => {
    service.storeTokens('access-1', 'refresh-1');

    service.clear();

    expect(service.getAccessToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
  });
});
