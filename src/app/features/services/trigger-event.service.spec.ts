import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TriggerEventService } from './trigger-event.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';

describe('TriggerEventService', () => {
  let service: TriggerEventService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TriggerEventService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches all events', () => {
    service.getAllEvents().subscribe((events) => {
      expect(events.length).toBe(2);
    });

    const req = httpMock.expectOne(API_ENDPOINTS.triggers.events);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1 }, { id: 2 }]);
  });

  it('fetches a single event', () => {
    service.getEvent(1).subscribe((event) => {
      expect(event.id).toBe(1);
    });

    httpMock.expectOne(API_ENDPOINTS.triggers.eventById(1)).flush({ id: 1 });
  });

  it('fetches events by status, product and zone', () => {
    service.getEventsByStatus('DETECTED').subscribe();
    httpMock.expectOne(API_ENDPOINTS.triggers.eventsByStatus('DETECTED')).flush([]);

    service.getEventsByProduct(4).subscribe();
    httpMock.expectOne(API_ENDPOINTS.triggers.eventsByProduct(4)).flush([]);

    service.getEventsByZone(6).subscribe();
    httpMock.expectOne(API_ENDPOINTS.triggers.eventsByZone(6)).flush([]);
  });
});
