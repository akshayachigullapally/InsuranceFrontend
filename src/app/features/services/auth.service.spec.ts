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

  it('refreshes the access token', () => {
    service.refresh({ refreshToken: 'refresh' }).subscribe();

    const req = httpMock.expectOne(API_ENDPOINTS.auth.refresh);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken: 'refresh' });
    req.flush(authResponse);
  });

  it('sends the refresh token when logging out', () => {
    service.logout('refresh').subscribe((response) => {
      expect(response.message).toBe('Logged out');
    });

    const req = httpMock.expectOne(API_ENDPOINTS.auth.logout);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken: 'refresh' });
    req.flush({ message: 'Logged out' });
  });

  it('fetches the current user', () => {
    service.me().subscribe((user) => {
      expect(user.email).toBe('asha@example.com');
    });

    const req = httpMock.expectOne(API_ENDPOINTS.auth.me);
    expect(req.request.method).toBe('GET');
    req.flush(authResponse.user);
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

  it('propagates server errors to the caller', () => {
    let status = 0;

    service.login({ email: 'x@example.com', password: 'wrong' }).subscribe({
      error: (error) => (status = error.status),
    });

    httpMock
      .expectOne(API_ENDPOINTS.auth.login)
      .flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    expect(status).toBe(401);
  });
});
