import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { ZoneService } from '../../services/zone.service';
import { CurrentMeasurementService } from '../../services/current-measurement.service';
import { ProductResponse } from '../../dtos/products/product-response.dto';
import { ZoneResponse } from '../../dtos/zones/zone-response.dto';
import { CurrentMeasurementResult } from '../../dtos/triggers/current-measurement.dto';

interface MeasurementForm {
  zoneId: FormControl<number | null>;
  currentValue: FormControl<number | null>;
}

@Component({
  selector: 'app-admin-current-measurements',
  standalone: true,
  imports: [AsyncPipe, DecimalPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-current-measurements.component.html',
  styleUrl: './admin-current-measurements.component.css',
})
export class AdminCurrentMeasurementsComponent implements OnInit {
  products: ProductResponse[] = [];
  zones: ZoneResponse[] = [];
  results = new Map<number, CurrentMeasurementResult>();
  processing = new Set<number>();
  error = '';

  readonly forms = new Map<number, FormGroup<MeasurementForm>>();

  constructor(
    private readonly productService: ProductService,
    private readonly zoneService: ZoneService,
    private readonly measurementService: CurrentMeasurementService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      products: this.productService.getAdminProducts(),
      zones: this.zoneService.getActiveZones(),
    }).subscribe({
      next: ({ products, zones }) => {
        this.products = products.filter(product => product.status === 'ACTIVE');
        this.zones = zones;
        this.products.forEach(product => this.forms.set(product.id, this.createForm(product)));
      },
      error: error => this.error = error?.error?.message ?? 'Unable to load measurement data.',
    });
  }

  form(productId: number): FormGroup<MeasurementForm> {
    return this.forms.get(productId)!;
  }

  label(product: ProductResponse): string {
    const names: Record<string, string> = {
      RAINFALL: 'Current rainfall',
      WATER_LEVEL: 'Current water level',
      RIVER_LEVEL: 'Current water level',
      TEMPERATURE: 'Current temperature',
      WIND_SPEED: 'Current wind speed',
      HUMIDITY: 'Current humidity',
      SOIL_MOISTURE: 'Current soil moisture',
    };
    return names[product.measurementType ?? ''] ?? 'Current measurement';
  }

  useMatchingValue(product: ProductResponse): void {
    const threshold = Number(product.thresholdValue ?? 0);
    const operator = product.comparisonOperator ?? 'GREATER_THAN_OR_EQUAL';
    const value = operator === 'GREATER_THAN' ? threshold + 1 : operator === 'LESS_THAN' ? Math.max(0, threshold - 1) : threshold;
    this.form(product.id).controls.currentValue.setValue(value);
  }

  process(product: ProductResponse): void {
    const form = this.form(product.id);
    if (form.invalid || !form.controls.zoneId.value || form.controls.currentValue.value === null) {
      form.markAllAsTouched();
      return;
    }

    this.processing.add(product.id);
    this.error = '';
    this.measurementService.process({
      productId: product.id,
      locationZoneId: form.controls.zoneId.value,
      currentValue: Number(form.controls.currentValue.value),
      idempotencyKey: `MEASUREMENT:${product.id}:${form.controls.zoneId.value}:${Date.now()}`,
    }).subscribe({
      next: result => {
        this.results.set(product.id, result);
        this.processing.delete(product.id);
      },
      error: error => {
        this.error = error?.error?.message ?? 'Measurement processing failed.';
        this.processing.delete(product.id);
      },
    });
  }

  private createForm(product: ProductResponse): FormGroup<MeasurementForm> {
    return new FormGroup<MeasurementForm>({
      zoneId: new FormControl<number | null>(null, Validators.required),
      currentValue: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    });
  }
}
