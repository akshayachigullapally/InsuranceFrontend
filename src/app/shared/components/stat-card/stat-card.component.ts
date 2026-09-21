import { Component, input } from '@angular/core';

export type StatTrend = 'up' | 'down' | 'flat';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.css',
})
export class StatCardComponent {
  readonly label = input<string>('');
  readonly value = input<string | number>('0');
  readonly hint = input<string>('');
  readonly icon = input<string>('');
  readonly trend = input<StatTrend | null>(null);

  protected iconClass(): string {
    const map: Record<string, string> = {
      blue: 'bg-brand-50 text-brand-600',
      green: 'bg-success-50 text-success-700',
      amber: 'bg-warn-50 text-warn-700',
      red: 'bg-danger-50 text-danger-700',
      navy: 'bg-navy-100 text-navy-800',
      gray: 'bg-gray-100 text-gray-600',
    };
    return map[this.color()] ?? map['blue'];
  }

  readonly color = input<'blue' | 'green' | 'amber' | 'red' | 'navy' | 'gray'>('blue');

  protected trendClass(): string {
    switch (this.trend()) {
      case 'up':
        return 'bg-success-50 text-success-700';
      case 'down':
        return 'bg-danger-50 text-danger-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  protected trendLabel(): string {
    switch (this.trend()) {
      case 'up':
        return '▲';
      case 'down':
        return '▼';
      default:
        return '—';
    }
  }
}