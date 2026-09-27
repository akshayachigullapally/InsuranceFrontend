import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  ViewEncapsulation,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import type * as Leaflet from 'leaflet';
import { ZoneRisk } from '../../../features/utils/risk-metrics';
import { LiveConditionState } from '../../../features/dtos/triggers/trigger-condition.dto';

export const ZONE_STATE_COLORS: Record<LiveConditionState, string> = {
  THRESHOLD_EXCEEDED: '#dc2626',
  APPROACHING: '#d97706',
  NORMAL: '#16a34a',
  NO_DATA: '#6b7280',
};

/**
 * Leaflet map of insured zones: each zone is a circle of its radius,
 * coloured by the worst live reading vs product thresholds.
 */
@Component({
  selector: 'app-zone-risk-map',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './zone-risk-map.component.css',
  template: `
    <div #mapHost class="zone-risk-map h-[420px] w-full rounded-xl border border-gray-200 bg-gray-50"></div>
    @if (loadError) {
      <p class="mt-2 text-sm text-danger-700">{{ loadError }}</p>
    }
  `,
})
export class ZoneRiskMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly zones = input<ZoneRisk[]>([]);
  readonly zoneSelected = output<number>();

  protected loadError: string | null = null;

  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('mapHost');
  private readonly platformId = inject(PLATFORM_ID);
  private leaflet: typeof Leaflet | null = null;
  private map: Leaflet.Map | null = null;
  private layer: Leaflet.LayerGroup | null = null;

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      const module = await import('leaflet');
      this.leaflet = ((module as unknown as { default?: typeof Leaflet }).default ?? module) as typeof Leaflet;
      this.map = this.leaflet.map(this.host().nativeElement, {
        center: [20.6, 78.9],
        zoom: 5,
        scrollWheelZoom: false,
      });
      this.leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '&copy; OpenStreetMap contributors',
        })
        .addTo(this.map);
      this.layer = this.leaflet.layerGroup().addTo(this.map);
      this.render();
    } catch {
      this.loadError = 'The map could not be loaded.';
    }
  }

  ngOnChanges(): void {
    this.render();
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  private render(): void {
    const L = this.leaflet;
    if (!L || !this.map || !this.layer) {
      return;
    }
    this.layer.clearLayers();

    const placed = this.zones().filter(zone => zone.latitude !== null && zone.longitude !== null);
    const bounds: Leaflet.LatLngExpression[] = [];

    for (const zone of placed) {
      const center: Leaflet.LatLngExpression = [Number(zone.latitude), Number(zone.longitude)];
      const color = ZONE_STATE_COLORS[zone.state];
      bounds.push(center);

      L.circle(center, {
        radius: Math.max(1, Number(zone.radiusKm) || 5) * 1000,
        color,
        weight: 2,
        fillColor: color,
        fillOpacity: zone.activePolicies > 0 ? 0.3 : 0.1,
      })
        .bindPopup(popupHtml(zone))
        .on('click', () => this.zoneSelected.emit(zone.zoneId))
        .addTo(this.layer);

      L.circleMarker(center, {
        radius: 4,
        color,
        fillColor: color,
        fillOpacity: 1,
        weight: 1,
      })
        .bindTooltip(zone.zoneName)
        .addTo(this.layer);
    }

    if (bounds.length === 1) {
      this.map.setView(bounds[0], 10);
    } else if (bounds.length > 1) {
      this.map.fitBounds(L.latLngBounds(bounds), { padding: [30, 30], maxZoom: 11 });
    }
  }
}

function popupHtml(zone: ZoneRisk): string {
  const money = (value: number) => '₹ ' + Math.round(value).toLocaleString('en-IN');
  const ratio = zone.lossRatio === null ? '–' : `${Math.round(zone.lossRatio * 100)}%`;
  const readings = zone.readings.length === 0
    ? '<p class="zrm-muted">No live readings</p>'
    : zone.readings
      .map(reading => `<p><span style="color:${ZONE_STATE_COLORS[reading.state]}">●</span> ${escapeHtml(reading.productName)}: `
        + `<b>${reading.currentValue} ${escapeHtml(reading.measurementUnit ?? '')}</b>`
        + (reading.thresholdValue !== null ? ` / trigger ${reading.thresholdValue}` : '')
        + '</p>')
      .join('');
  return `<div class="zrm-popup">
    <p class="zrm-title">${escapeHtml(zone.zoneName)}</p>
    <p>${zone.activePolicies} active ${zone.activePolicies === 1 ? 'policy' : 'policies'} · exposure ${money(zone.exposure)}</p>
    <p>Premiums ${money(zone.premiums)} · payouts ${money(zone.payouts)} · loss ratio ${ratio}</p>
    <div class="zrm-readings">${readings}</div>
  </div>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char] as string);
}
