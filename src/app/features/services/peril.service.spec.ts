import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PerilService } from './peril.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';

describe('PerilService', () => {
  let service: PerilService;
  let httpMock: HttpTestingController;


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PerilService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches all perils and a single peril', () => {
    service.getAllPerils().subscribe((perils) => {
      expect(perils.length).toBe(1);
    });
    httpMock.expectOne({ url: API_ENDPOINTS.triggers.perils, method: 'GET' }).flush([{ id: 1 }]);

    service.getPeril(1).subscribe();
    httpMock.expectOne({ url: API_ENDPOINTS.triggers.perilById(1), method: 'GET' }).flush({ id: 1 });
  });

  it('updates the status and archives a peril', () => {
    service.updatePerilStatus(2, 'INACTIVE' as never).subscribe();
    const status = httpMock.expectOne(API_ENDPOINTS.triggers.perilStatus(2));
    expect(status.request.body).toEqual({ status: 'INACTIVE' });
    status.flush({ id: 2 });

    service.archivePeril(2).subscribe();
    httpMock
      .expectOne({ url: API_ENDPOINTS.triggers.perilById(2), method: 'DELETE' })
      .flush({ message: 'Archived' });
  });
});
