import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ZoneService } from './zone.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ZoneRequest } from '../dtos/zones/zone-response.dto';

describe('ZoneService', () => {
  let service: ZoneService;
  let httpMock: HttpTestingController;

  const zoneRequest = {
    zoneCode: '  hyd gachibowli-zone ',
    zoneName: ' Hyderabad Gachibowli Zone ',
    country: ' India ',
    state: ' Telangana ',
    district: ' Hyderabad ',
    postalCode: '   ',
    latitude: '17.44' as unknown as number,
    longitude: '78.34' as unknown as number,
    radiusKm: '5' as unknown as number,
  } as ZoneRequest;

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

  it('fetches active zones', () => {
    service.getActiveZones().subscribe((zones) => {
      expect(zones.length).toBe(1);
    });

    httpMock.expectOne(API_ENDPOINTS.triggers.zonesActive).flush([{ id: 1 }]);
  });

  it('normalises the request before creating a zone', () => {
    service.createZone(zoneRequest).subscribe();

    const req = httpMock.expectOne({ url: API_ENDPOINTS.triggers.zones, method: 'POST' });
    expect(req.request.body).toEqual({
      zoneCode: 'HYD_GACHIBOWLI_ZONE',
      zoneName: 'Hyderabad Gachibowli Zone',
      country: 'India',
      state: 'Telangana',
      district: 'Hyderabad',
      postalCode: undefined,
      latitude: 17.44,
      longitude: 78.34,
      radiusKm: 5,
    });
    req.flush({ id: 20 });
  });

  it('normalises the request before updating a zone', () => {
    service.updateZone(20, { ...zoneRequest, postalCode: ' 500032 ' }).subscribe();

    const req = httpMock.expectOne({ url: API_ENDPOINTS.triggers.zoneById(20), method: 'PUT' });
    expect(req.request.body.zoneCode).toBe('HYD_GACHIBOWLI_ZONE');
    expect(req.request.body.postalCode).toBe('500032');
    req.flush({ id: 20 });
  });

  it('updates the status and archives a zone', () => {
    service.updateZoneStatus(20, 'INACTIVE' as never).subscribe();
    const status = httpMock.expectOne(API_ENDPOINTS.triggers.zoneStatus(20));
    expect(status.request.method).toBe('PUT');
    expect(status.request.body).toEqual({ status: 'INACTIVE' });
    status.flush({ id: 20 });

    service.archiveZone(20).subscribe();
    httpMock
      .expectOne({ url: API_ENDPOINTS.triggers.zoneById(20), method: 'DELETE' })
      .flush({ message: 'Archived' });
  });
});
