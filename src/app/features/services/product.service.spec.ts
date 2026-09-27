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

  it('fetches a product by id and by category', () => {
    service.getProduct(3).subscribe();
    httpMock.expectOne({ url: API_ENDPOINTS.products.getById(3), method: 'GET' }).flush({ id: 3 });

    service.getProductsByCategory('WEATHER' as never).subscribe();
    httpMock.expectOne(API_ENDPOINTS.products.byCategory('WEATHER')).flush([]);
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

  it('wraps the status in a body when updating product status', () => {
    service.updateProductStatus(9, 'INACTIVE' as never).subscribe();

    const req = httpMock.expectOne(API_ENDPOINTS.products.adminStatus(9));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ status: 'INACTIVE' });
    req.flush({ id: 9 });
  });

  it('deletes a product', () => {
    service.deleteProduct(9).subscribe();

    httpMock
      .expectOne({ url: API_ENDPOINTS.products.adminDelete(9), method: 'DELETE' })
      .flush({ message: 'Deleted' });
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

  it('fetches admin products and measurement status', () => {
    service.getAdminProducts().subscribe();
    httpMock.expectOne(API_ENDPOINTS.products.adminAll).flush([]);

    service.getAdminMeasurementStatus().subscribe();
    httpMock.expectOne(API_ENDPOINTS.products.adminMeasurementStatus).flush([]);

    service.getMeasurementStatus().subscribe();
    httpMock.expectOne(API_ENDPOINTS.products.measurementStatus).flush([]);
  });
});
