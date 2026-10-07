import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const authResponse = {
    accessToken: 'access',
    refreshToken: 'refresh',
    user: { id: 1, fullName: 'Asha Rao', email: 'asha@example.com', role: 'CUSTOMER' },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('logs in with the given credentials', () => {
    const request = { email: 'asha@example.com', password: 'secret123' };

    service.login(request).subscribe((response) => {
      expect(response.accessToken).toBe('access');
    });

    const req = httpMock.expectOne(API_ENDPOINTS.auth.login);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(authResponse);
  });

  it('registers a new customer', () => {
    const request = { fullName: 'Asha Rao', email: 'asha@example.com', password: 'secret123' };

    service.register(request).subscribe((response) => {
      expect(response.user.fullName).toBe('Asha Rao');
    });

    const req = httpMock.expectOne(API_ENDPOINTS.auth.register);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(authResponse);
  });

  it('lists and revokes sessions', () => {
    service.getSessions().subscribe((sessions) => {
      expect(sessions.length).toBe(1);
    });
    httpMock.expectOne({ url: API_ENDPOINTS.auth.sessions, method: 'GET' }).flush([{ id: 7 }]);

    service.revokeSession(7).subscribe();
    httpMock
      .expectOne({ url: API_ENDPOINTS.auth.revokeSession(7), method: 'DELETE' })
      .flush({ message: 'Revoked' });
  });
});
