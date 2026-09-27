import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CurrentMeasurementService } from './current-measurement.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';

describe('CurrentMeasurementService', () => {
  let service: CurrentMeasurementService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CurrentMeasurementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('submits a measurement for processing', () => {
    const request = { locationZoneId: 1, measurementType: 'RAINFALL', value: 160 } as never;

    service.process(request).subscribe();

    const req = httpMock.expectOne(API_ENDPOINTS.triggers.currentMeasurements);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush({});
  });

  it('fetches the current measurement snapshots', () => {
    service.getCurrentMeasurements().subscribe((snapshots) => {
      expect(snapshots).toEqual([]);
    });

    const req = httpMock.expectOne(API_ENDPOINTS.triggers.currentMeasurementsList);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
