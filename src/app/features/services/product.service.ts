import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  ProductTriggerSyncResponse,
  ProductTriggerThresholdHistoryResponse,
  ProductTriggerThresholdUpdateRequest,
  ProductTriggerThresholdUpdateResponse,
} from '../dtos/triggers/trigger-condition.dto';
import { MeasurementStatusResponse } from '../dtos/triggers/measurement-status.dto';
import {
  MessageResponse,
  ProductCategory,
  ProductRequest,
  ProductResponse,
  ProductStatus,
} from '../dtos/products/product-response.dto';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private readonly http: HttpClient) {}

  getActiveProducts(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(
      API_ENDPOINTS.products.base,
    );
  }

  getProduct(productId: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(
      API_ENDPOINTS.products.getById(productId),
    );
  }

  getProductsByCategory(
    category: ProductCategory,
  ): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(
      API_ENDPOINTS.products.byCategory(category),
    );
  }

  getAdminProducts(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(
      API_ENDPOINTS.products.adminAll,
    );
  }

  getAdminMeasurementStatus(): Observable<MeasurementStatusResponse> {
    return this.http.get<MeasurementStatusResponse>(
      API_ENDPOINTS.products.adminMeasurementStatus,
    );
  }

  getAdminProduct(productId: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(
      API_ENDPOINTS.products.adminById(productId),
    );
  }

  createProduct(
    request: ProductRequest,
  ): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(
      API_ENDPOINTS.products.adminCreate,
      request,
    );
  }

  updateProduct(
    productId: number,
    request: ProductRequest,
  ): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(
      API_ENDPOINTS.products.adminUpdate(productId),
      request,
    );
  }

  updateProductStatus(
    productId: number,
    status: ProductStatus,
  ): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(
      API_ENDPOINTS.products.adminStatus(productId),
      { status },
    );
  }

  deleteProduct(productId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(
      API_ENDPOINTS.products.adminDelete(productId),
    );
  }

  updateThreshold(
    productId: number,
    request: ProductTriggerThresholdUpdateRequest,
  ): Observable<ProductTriggerThresholdUpdateResponse> {
    return this.http.put<ProductTriggerThresholdUpdateResponse>(
      API_ENDPOINTS.products.threshold(productId),
      request,
    );
  }

  getThresholdHistory(
    productId: number,
  ): Observable<ProductTriggerThresholdHistoryResponse[]> {
    return this.http.get<ProductTriggerThresholdHistoryResponse[]>(
      API_ENDPOINTS.products.thresholdHistory(productId),
    );
  }

  syncTrigger(
}