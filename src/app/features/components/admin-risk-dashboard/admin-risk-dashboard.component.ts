import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { PaymentService } from '../../services/payment.service';
import { PayoutService } from '../../services/payout.service';
import { PolicyService } from '../../services/policy.service';
import { ProductService } from '../../services/product.service';
import { ZoneService } from '../../services/zone.service';
import { CurrentMeasurementService } from '../../services/current-measurement.service';
import {
  RiskSummary,
  ZoneRisk,
  buildRiskSummary,
  lossRatioBand,
} from '../../utils/risk-metrics';
import { LIVE_CONDITION_STATE_LABELS } from '../../utils/trigger-display';
import { LiveConditionState } from '../../dtos/triggers/trigger-condition.dto';
import { ZoneRiskMapComponent, ZONE_STATE_COLORS } from '../../../shared/components/zone-risk-map/zone-risk-map.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';

/**
 * Admin risk dashboard: loss ratio (payouts / premiums) per product and zone,
 * exposure (sum insured of active policies) per zone, and a map of zones with
 * live readings against product thresholds.
 */
@Component({
  selector: 'app-admin-risk-dashboard',
  standalone: true,
  imports: [DatePipe, DecimalPipe, PercentPipe, ZoneRiskMapComponent, LoadingSpinnerComponent, ErrorMessageComponent],
  templateUrl: './admin-risk-dashboard.component.html',
})
export class AdminRiskDashboardComponent implements OnInit {
  protected readonly summary = signal<RiskSummary | null>(null);
  protected readonly loading = signal(true);
  protected readonly warnings = signal<string[]>([]);
  protected readonly selectedZoneId = signal<number | null>(null);
  protected readonly loadedAt = signal<Date | null>(null);

  protected readonly stateLabels = LIVE_CONDITION_STATE_LABELS;
  protected readonly stateColors = ZONE_STATE_COLORS;
  protected readonly legend: LiveConditionState[] = ['THRESHOLD_EXCEEDED', 'APPROACHING', 'NORMAL', 'NO_DATA'];

  private readonly policyService = inject(PolicyService);
  private readonly paymentService = inject(PaymentService);
  private readonly payoutService = inject(PayoutService);
  private readonly productService = inject(ProductService);
  private readonly zoneService = inject(ZoneService);
  private readonly measurementService = inject(CurrentMeasurementService);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    const warnings: string[] = [];
    const safe = <T>(source: Observable<T[]>, label: string): Observable<T[]> =>
      source.pipe(catchError(() => {
        warnings.push(label);
        return of([] as T[]);
      }));

    forkJoin({
      policies: safe(this.policyService.getAllPolicies(), 'policies'),
      payments: safe(this.paymentService.getAllPayments(), 'payments'),
      payouts: safe(this.payoutService.getAllPayouts(), 'payouts'),
      products: safe(this.productService.getAdminProducts(), 'products'),
      zones: safe(this.zoneService.getAllZones(), 'zones'),
      measurements: safe(this.measurementService.getCurrentMeasurements(), 'live readings'),
    }).subscribe(data => {
      this.summary.set(buildRiskSummary(data));
      this.warnings.set(warnings);
      this.loadedAt.set(new Date());
      this.loading.set(false);
    });
  }

  protected band(ratio: number | null): string {
    switch (lossRatioBand(ratio)) {
      case 'good': return 'bg-success-50 text-success-700';
      case 'watch': return 'bg-warn-50 text-warn-700';
      case 'bad': return 'bg-danger-50 text-danger-700';
      default: return 'bg-gray-100 text-gray-500';
    }
  }

  protected selectZone(zoneId: number): void {
    this.selectedZoneId.set(zoneId);
    document.getElementById(`zone-row-${zoneId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  protected zoneShare(zone: ZoneRisk, summary: RiskSummary): number {
    return summary.totals.exposure > 0 ? (zone.exposure / summary.totals.exposure) * 100 : 0;
  }
}
