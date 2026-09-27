import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, catchError, forkJoin, of, timer } from 'rxjs';
import { PolicyService } from '../../services/policy.service';
import { ProductService } from '../../services/product.service';
import { ZoneService } from '../../services/zone.service';
import { CurrentMeasurementService } from '../../services/current-measurement.service';
import { MapZone, buildMapZones } from '../../utils/zone-map-data';
import { LIVE_CONDITION_STATE_LABELS } from '../../utils/trigger-display';
import { LiveConditionState } from '../../dtos/triggers/trigger-condition.dto';
import { ZONE_STATE_COLORS, ZoneMapComponent } from '../../../shared/components/zone-map/zone-map.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';

const REFRESH_MS = 30_000;

/**
 * Map of zones with live readings against trigger thresholds.
 * Admin (route data audience = 'admin'): every zone and its active policy count.
 * Customer: every zone, with the customer's insured zones highlighted.
 */
@Component({
  selector: 'app-zone-map-page',
  standalone: true,
  imports: [DatePipe, ZoneMapComponent, LoadingSpinnerComponent, ErrorMessageComponent],
  templateUrl: './zone-map-page.component.html',
})
export class ZoneMapPageComponent implements OnInit, OnDestroy {
  protected readonly zones = signal<MapZone[] | null>(null);
  protected readonly warnings = signal<string[]>([]);
  protected readonly loadedAt = signal<Date | null>(null);
  protected readonly selectedZoneId = signal<number | null>(null);
  protected audience: 'admin' | 'customer' = 'admin';

  protected readonly stateLabels = LIVE_CONDITION_STATE_LABELS;
  protected readonly stateColors = ZONE_STATE_COLORS;
  protected readonly legend: LiveConditionState[] = ['THRESHOLD_EXCEEDED', 'APPROACHING', 'NORMAL', 'NO_DATA'];

  private readonly route = inject(ActivatedRoute);
  private readonly policyService = inject(PolicyService);
  private readonly productService = inject(ProductService);
  private readonly zoneService = inject(ZoneService);
  private readonly measurementService = inject(CurrentMeasurementService);
  private refresh?: Subscription;

  ngOnInit(): void {
    this.audience = this.route.snapshot.data['audience'] === 'customer' ? 'customer' : 'admin';
    this.refresh = timer(0, REFRESH_MS).subscribe(() => this.load());
  }

  ngOnDestroy(): void {
    this.refresh?.unsubscribe();
  }

  protected load(): void {
    const warnings: string[] = [];
    const safe = <T>(source: Observable<T[]>, label: string): Observable<T[]> =>
      source.pipe(catchError(() => {
        warnings.push(label);
        return of([] as T[]);
      }));
    const customer = this.audience === 'customer';

    forkJoin({
      zones: safe(customer ? this.zoneService.getActiveZones() : this.zoneService.getAllZones(), 'zones'),
      products: safe(customer ? this.productService.getActiveProducts() : this.productService.getAdminProducts(), 'products'),
      readings: safe(this.measurementService.getZoneMeasurements(), 'live readings'),
      policies: safe(customer ? this.policyService.getMyPolicies() : this.policyService.getAllPolicies(), 'policies'),
    }).subscribe(data => {
      this.zones.set(buildMapZones(data));
      this.warnings.set(warnings);
      this.loadedAt.set(new Date());
    });
  }

  protected selectZone(zoneId: number): void {
    this.selectedZoneId.set(zoneId);
    document.getElementById(`zone-row-${zoneId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  protected count(zones: MapZone[], state: LiveConditionState): number {
    return zones.filter(zone => zone.state === state).length;
  }
}
