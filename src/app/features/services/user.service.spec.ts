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

  it('looks up a user name once and reuses it', () => {
    const names: (string | null)[] = [];
    service.getUserName(6).subscribe((name) => names.push(name));
    service.getUserName(6).subscribe((name) => names.push(name));

    const req = httpMock.expectOne(API_ENDPOINTS.users.getById(6));
    req.flush({ id: 6, fullName: 'Ravi Kumar' });

    expect(names).toEqual(['Ravi Kumar', 'Ravi Kumar']);
  });

  it('returns null when the user cannot be loaded', () => {
    let name: string | null | undefined;
    service.getUserName(7).subscribe((value) => (name = value));

    httpMock.expectOne(API_ENDPOINTS.users.getById(7)).flush('Not found', {
      status: 404,
      statusText: 'Not Found',
    });

    expect(name).toBeNull();
  });
});
