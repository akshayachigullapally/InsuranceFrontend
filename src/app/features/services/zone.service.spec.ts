import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ZoneService } from './zone.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';

describe('ZoneService', () => {
  let service: ZoneService;
  let httpMock: HttpTestingController;


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ZoneService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches all zones without a state filter', () => {
    service.getAllZones().subscribe();

    const req = httpMock.expectOne(API_ENDPOINTS.triggers.zones);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('state')).toBe(false);
    req.flush([]);
  });

  it('trims the state filter and skips it when blank', () => {
    service.getAllZones('  Telangana ').subscribe();
    const filtered = httpMock.expectOne(
      (request) => request.url === API_ENDPOINTS.triggers.zones,
    );
    expect(filtered.request.params.get('state')).toBe('Telangana');
    filtered.flush([]);

    service.getAllZones('   ').subscribe();
    const blank = httpMock.expectOne(
      (request) => request.url === API_ENDPOINTS.triggers.zones,
    );
    expect(blank.request.params.has('state')).toBe(false);
    blank.flush([]);
  });
});
