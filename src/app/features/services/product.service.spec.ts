import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches active products', () => {
    service.getActiveProducts().subscribe((products) => {
      expect(products.length).toBe(2);
    });

    const req = httpMock.expectOne({ url: API_ENDPOINTS.products.base, method: 'GET' });
    req.flush([{ id: 1 }, { id: 2 }]);
  });

  it('creates and updates products', () => {
    const request = { productCode: 'WEATHER-002' } as never;

    service.createProduct(request).subscribe();
    const create = httpMock.expectOne({ url: API_ENDPOINTS.products.adminCreate, method: 'POST' });
    expect(create.request.body).toEqual(request);
    create.flush({ id: 9 });

    service.updateProduct(9, request).subscribe();
    const update = httpMock.expectOne({ url: API_ENDPOINTS.products.adminUpdate(9), method: 'PUT' });
    expect(update.request.body).toEqual(request);
    update.flush({ id: 9 });
  });

  it('updates a trigger threshold and fetches its history', () => {
    const request = { thresholdValue: 120 } as never;

    service.updateThreshold(2, request).subscribe();
    const update = httpMock.expectOne({ url: API_ENDPOINTS.products.threshold(2), method: 'PUT' });
    expect(update.request.body).toEqual(request);
    update.flush({});

    service.getThresholdHistory(2).subscribe();
    httpMock.expectOne(API_ENDPOINTS.products.thresholdHistory(2)).flush([]);
  });
});
