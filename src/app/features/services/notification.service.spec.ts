import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NotificationService } from './notification.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });

  it('fetches notifications created after a timestamp', () => {
    const createdAfter = '2026-09-21T00:00:00Z';

    service.getMyNotificationsCreatedAfter(createdAfter).subscribe((notifications) => {
      expect(notifications).toEqual([]);
    });

    const req = httpMock.expectOne(
      (request) =>
        request.url === API_ENDPOINTS.notifications.myNotifications &&
        request.params.get('createdAfter') === createdAfter,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('createdAfter')).toBe(createdAfter);
    req.flush([]);
  });
});