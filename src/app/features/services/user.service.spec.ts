import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches all users without filters', () => {
    service.getAllUsers().subscribe((users) => {
      expect(users).toEqual([]);
    });

    const req = httpMock.expectOne(API_ENDPOINTS.users.getAll);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys()).toEqual([]);
    req.flush([]);
  });

  it('adds status and segment filters when provided', () => {
    service.getAllUsers('ACTIVE' as never, 'FARMER' as never).subscribe();

    const req = httpMock.expectOne(
      (request) => request.url === API_ENDPOINTS.users.getAll,
    );
    expect(req.request.params.get('status')).toBe('ACTIVE');
    expect(req.request.params.get('segment')).toBe('FARMER');
    req.flush([]);
  });

  it('fetches a single user', () => {
    service.getUser(4).subscribe((user) => {
      expect(user.id).toBe(4);
    });

    httpMock.expectOne(API_ENDPOINTS.users.getById(4)).flush({ id: 4 });
  });

  it('updates a user status', () => {
    service.updateUserStatus(4, 'SUSPENDED' as never).subscribe();

    const req = httpMock.expectOne(API_ENDPOINTS.users.updateStatus(4));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ status: 'SUSPENDED' });
    req.flush({ id: 4, status: 'SUSPENDED' });
  });
});
