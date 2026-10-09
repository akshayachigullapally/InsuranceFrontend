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

  it('marks a notification as read', () => {
    service.markAsRead(7).subscribe((notification) => {
      expect(notification.id).toBe(7);
    });

    const req = httpMock.expectOne(API_ENDPOINTS.notifications.markRead(7));
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 7, read: true });
  });
});