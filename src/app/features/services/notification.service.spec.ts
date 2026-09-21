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

  it('fetches my notifications', () => {
    service.getMyNotifications().subscribe((notifications) => {
      expect(notifications).toEqual([]);
    });

    const req = httpMock.expectOne(API_ENDPOINTS.notifications.myNotifications);
    expect(req.request.method).toBe('GET');
    req.flush([]);
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

  it('fetches the unread count', () => {
    service.getUnreadCount().subscribe((response) => {
      expect(response.count).toBe(3);
    });

    const req = httpMock.expectOne(API_ENDPOINTS.notifications.myUnreadCount);
    expect(req.request.method).toBe('GET');
    req.flush({ count: 3 });
  });

  it('marks a notification as read', () => {
    const notificationId = 42;
    service.markAsRead(notificationId).subscribe((notification) => {
      expect(notification.id).toBe(notificationId);
    });

    const req = httpMock.expectOne(API_ENDPOINTS.notifications.markRead(notificationId));
    expect(req.request.method).toBe('PUT');
    req.flush({ id: notificationId, read: true });
  });
});