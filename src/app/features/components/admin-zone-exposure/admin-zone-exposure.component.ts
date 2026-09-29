import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ZoneExposureResponse } from '../../dtos/zones/zone-response.dto';
import { ZoneService } from '../../services/zone.service';
import { httpErrorMessage } from '../../state/products/products.effects';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

/** Share of a zone's cap at which the bar turns amber, warning that sales will stop soon. */
export const EXPOSURE_WARNING_PERCENT = 80;

@Component({
  selector: 'app-admin-zone-exposure',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatCardComponent,
  ],
  templateUrl: './admin-zone-exposure.component.html',
})
export class AdminZoneExposureComponent implements OnInit {
  protected readonly zones = signal<ZoneExposureResponse[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly totalCover = computed(() =>
    this.zones().reduce((sum, zone) => sum + Number(zone.usedExposure ?? 0), 0),
  );
  protected readonly zonesOnAlert = computed(() => this.zones().filter((zone) => zone.weatherAlert).length);
  protected readonly zonesClosed = computed(() => this.zones().filter((zone) => !zone.salesOpen).length);

  constructor(private readonly zoneService: ZoneService) {}

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.zoneService.getZoneExposure().subscribe({
      next: (zones) => {
        this.zones.set(zones);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(httpErrorMessage(error));
        this.loading.set(false);
      },
    });
  }

  /** Bar width, clamped to 0–100 %. */
  protected barWidth(zone: ZoneExposureResponse): number {
    return Math.min(100, Math.max(0, Number(zone.utilizationPercent ?? 0)));
  }

  protected barClass(zone: ZoneExposureResponse): string {
    const percent = Number(zone.utilizationPercent ?? 0);
    if (percent >= 100) return 'bg-red-500';
    if (percent >= EXPOSURE_WARNING_PERCENT) return 'bg-amber-500';
    return 'bg-green-500';
  }

  protected salesLabel(zone: ZoneExposureResponse): string {
    if (zone.weatherAlert) return 'Paused – weather alert';
    if (!zone.salesOpen) return 'Closed – cap reached';
    return 'Open';
  }
}
