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
});
