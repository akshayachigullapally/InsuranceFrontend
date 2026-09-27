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
import { MapZone } from '../../../features/utils/zone-map-data';
import { LiveConditionState } from '../../../features/dtos/triggers/trigger-condition.dto';

export const ZONE_STATE_COLORS: Record<LiveConditionState, string> = {
  THRESHOLD_EXCEEDED: '#dc2626',
  APPROACHING: '#d97706',
  NORMAL: '#16a34a',
  NO_DATA: '#6b7280',
};

/**
 * Leaflet map of zones: each zone is a circle of its radius, coloured by the
 * worst live reading against product trigger thresholds.
 */
@Component({
  selector: 'app-zone-map',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './zone-map.component.css',
  template: `
    <div #mapHost class="zone-map h-[460px] w-full rounded-xl border border-gray-200 bg-gray-50"></div>
    @if (loadError) {
      <p class="mt-2 text-sm text-danger-700">{{ loadError }}</p>
    }
  `,
})
export class ZoneMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly zones = input<MapZone[]>([]);
  /** 'customer' highlights the customer's insured zones and lists their policies. */
  readonly audience = input<'admin' | 'customer'>('admin');
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
      this.render(true);
    } catch {
      this.loadError = 'The map could not be loaded.';
    }
  }

  ngOnChanges(): void {
    this.render(false);
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  private render(fit: boolean): void {
    const L = this.leaflet;
    if (!L || !this.map || !this.layer) {
      return;
    }
    this.layer.clearLayers();

    const customer = this.audience() === 'customer';
    const placed = this.zones().filter(zone => zone.latitude !== null && zone.longitude !== null);
    // Customers: frame their own zones when they have any.
    const focus = customer && placed.some(zone => zone.activePolicies > 0)
      ? placed.filter(zone => zone.activePolicies > 0)
      : placed;
    const bounds: Leaflet.LatLngExpression[] = focus.map(zone => [Number(zone.latitude), Number(zone.longitude)]);

    for (const zone of placed) {
      const center: Leaflet.LatLngExpression = [Number(zone.latitude), Number(zone.longitude)];
      const color = ZONE_STATE_COLORS[zone.state];
      const insured = zone.activePolicies > 0;

      L.circle(center, {
        radius: Math.max(1, Number(zone.radiusKm) || 5) * 1000,
        color,
        weight: customer && insured ? 4 : 2,
        dashArray: customer && !insured ? '4 6' : undefined,
        fillColor: color,
        fillOpacity: insured ? 0.3 : 0.1,
      })
        .bindPopup(popupHtml(zone, customer))
        .on('click', () => this.zoneSelected.emit(zone.zoneId))
        .addTo(this.layer);

      L.circleMarker(center, { radius: 4, color, fillColor: color, fillOpacity: 1, weight: 1 })
        .bindTooltip(zone.zoneName)
        .addTo(this.layer);
    }

    if (!fit) {
      return;
    }
    if (bounds.length === 1) {
      this.map.setView(bounds[0], 10);
    } else if (bounds.length > 1) {
      this.map.fitBounds(L.latLngBounds(bounds), { padding: [30, 30], maxZoom: 11 });
    }
  }
}

function popupHtml(zone: MapZone, customer: boolean): string {
  const readings = zone.readings.length === 0
    ? '<p class="zrm-muted">No live readings</p>'
    : zone.readings
      .map(reading => `<p><span style="color:${ZONE_STATE_COLORS[reading.state]}">●</span> ${escapeHtml(reading.label)}: `
        + `<b>${reading.currentValue} ${escapeHtml(reading.unit)}</b>`
        + (reading.triggers.length > 0
          ? ` <span class="zrm-muted">(trigger ${reading.triggers.map(t => escapeHtml(t.thresholdText)).join(' / ')})</span>`
          : '')
        + '</p>')
      .join('');
  const policies = customer
    ? (zone.policyNumbers.length > 0
      ? `<p>Your policies: ${zone.policyNumbers.map(escapeHtml).join(', ')}</p>`
      : '<p class="zrm-muted">You have no active policy here</p>')
    : `<p>${zone.activePolicies} active ${zone.activePolicies === 1 ? 'policy' : 'policies'}</p>`;
  return `<div class="zrm-popup">
    <p class="zrm-title">${escapeHtml(zone.zoneName)}</p>
    ${policies}
    <div class="zrm-readings">${readings}</div>
  </div>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char] as string);
}
