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
});
