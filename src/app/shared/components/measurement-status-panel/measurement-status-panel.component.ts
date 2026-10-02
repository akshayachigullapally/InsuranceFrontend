import { AsyncPipe } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  BehaviorSubject,
  combineLatest,
  merge,
  Observable,
  of,
  Subject,
  timer,
} from 'rxjs';
import {
  catchError,
  map,
  switchMap,
  takeUntil,
} from 'rxjs/operators';
import { ProductResponse } from '../../../features/dtos/products/product-response.dto';
import { LiveConditionState } from '../../../features/dtos/triggers/trigger-condition.dto';
import {
  AdminMeasurementStatusCard,
  ManualReadingResponse,
} from '../../../features/dtos/triggers/measurement-status.dto';
import { ProductService } from '../../../features/services/product.service';
import { CurrentMeasurementService } from '../../../features/services/current-measurement.service';
import { ROLES } from '../../../core/constants/roles';
import { selectAuthUser } from '../../../features/state/auth/auth.selectors';
import { httpErrorMessage } from '../../../features/state/products/products.effects';
import {
  LIVE_CONDITION_STATE_COLORS,
  LIVE_CONDITION_STATE_LABELS,
  comparisonOperatorSymbol,
  formatThresholdValue,
  measurementTypeLabel,
  measurementUnitLabel,
} from '../../../features/utils/trigger-display';
import { ToastService } from '../../services/toast.service';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

interface ProductThresholdRow {
  productId: number;
  productCode: string;
  productName: string;
  threshold: number | null;
  operator: string | null;
  unit: string | null;
  state: LiveConditionState;
  /** How close the live value is to this product's trigger, 0–100; null without data. */
  progress: number | null;
}

interface MeasurementCard {
  measurementType: string;
  unit: string;
  latestValue: number | null;
  observedAt: string | null;
  /** MANUAL when an admin set the value, otherwise the demo feed. */
  source: string | null;
  state: LiveConditionState;
  rows: ProductThresholdRow[];
}

interface MeasurementTheme {
  /** SVG path data for a 24×24 stroke icon. */
  paths: string[];
  tile: string;
  bar: string;
}

const POLL_INTERVAL_MS = 10_000;

/** A row counts as "near trigger" once the live value is this close to the threshold. */
const APPROACHING_PERCENT = 80;

const WAVES = [
  'M3 15c1.5 0 1.5-1.5 3-1.5s1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5',
  'M3 19.5c1.5 0 1.5-1.5 3-1.5s1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5',
];

const MEASUREMENT_THEMES: Record<string, MeasurementTheme> = {
  RAINFALL: {
    paths: [
      'M7 15a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 6.5a4.25 4.25 0 0 1 0 8.5H7z',
      'M8 18.5l-1 2',
      'M12 18.5l-1 2',
      'M16 18.5l-1 2',
    ],
    tile: 'bg-sky-50 text-sky-600 ring-1 ring-inset ring-sky-100',
    bar: 'bg-sky-500',
  },
  HUMIDITY: {
    paths: ['M12 3.5c3.2 4 6 7.3 6 10.5a6 6 0 0 1-12 0c0-3.2 2.8-6.5 6-10.5z', 'M9.2 14.5a2.8 2.8 0 0 0 2.8 2.8'],
    tile: 'bg-cyan-50 text-cyan-600 ring-1 ring-inset ring-cyan-100',
    bar: 'bg-cyan-500',
  },
  RIVER_LEVEL: {
    paths: ['M5 4v6', 'M3.5 5.5h3', 'M3.5 8.5h3', 'M12 4.5l2.5 3h-5z', ...WAVES],
    tile: 'bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100',
    bar: 'bg-indigo-500',
  },
  WATER_LEVEL: {
    paths: ['M12 3v7', 'M9.5 7.5L12 10l2.5-2.5', ...WAVES],
    tile: 'bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100',
    bar: 'bg-blue-500',
  },
  TEMPERATURE: {
    paths: ['M14 14.76V5a2 2 0 0 0-4 0v9.76a4 4 0 1 0 4 0z', 'M12 17.5v-5', 'M17.5 6h2', 'M17.5 9.5h2'],
    tile: 'bg-orange-50 text-orange-600 ring-1 ring-inset ring-orange-100',
    bar: 'bg-orange-500',
  },
  WIND_SPEED: {
    paths: ['M3 8.5h10.5a2.75 2.75 0 1 0-2.75-2.75', 'M3 12.5h15a3 3 0 1 1-3 3', 'M3 16.5h6'],
    tile: 'bg-teal-50 text-teal-600 ring-1 ring-inset ring-teal-100',
    bar: 'bg-teal-500',
  },
  SOIL_MOISTURE: {
    paths: [
      'M12 19v-7',
      'M12 12c0-3.3 2.2-5.5 6-5.5 0 3.3-2.2 5.5-6 5.5z',
      'M12 14c0-2.8-1.9-4.5-5-4.5 0 2.8 1.9 4.5 5 4.5z',
      'M4 19.5h16',
    ],
    tile: 'bg-lime-50 text-lime-700 ring-1 ring-inset ring-lime-100',
    bar: 'bg-lime-500',
  },
};

const DEFAULT_THEME: MeasurementTheme = {
  paths: ['M4.5 17a8 8 0 1 1 15 0', 'M12 13l3.5-3.5', 'M12 13h.01'],
  tile: 'bg-violet-50 text-violet-600 ring-1 ring-inset ring-violet-100',
  bar: 'bg-violet-500',
};

@Component({
  selector: 'app-measurement-status-panel',
  standalone: true,
  imports: [AsyncPipe, FormsModule, EmptyStateComponent],
  templateUrl: './measurement-status-panel.component.html',
  styleUrl: './measurement-status-panel.component.css',
})
export class MeasurementStatusPanelComponent
  implements OnChanges, OnDestroy
{
  @Input() products: ProductResponse[] | null = [];

  readonly cards$: Observable<MeasurementCard[]>;
  protected readonly isAdmin$: Observable<boolean>;

  /** Measurement type whose live reading is being edited. */
  protected editingType: string | null = null;
  protected editingValue: number | null = null;
  protected saving = false;

  private readonly products$ = new BehaviorSubject<ProductResponse[]>([]);
  private readonly refresh$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly store: Store,
    private readonly productService: ProductService,
    private readonly measurementService: CurrentMeasurementService,
    private readonly toast: ToastService,
  ) {
    this.isAdmin$ = this.store.select(selectAuthUser).pipe(
      map(user => user?.role === ROLES.ADMIN),
    );

    this.cards$ = combineLatest([
      this.products$,
      this.isAdmin$.pipe(
        switchMap(isAdmin =>
          merge(timer(0, POLL_INTERVAL_MS), this.refresh$).pipe(
            switchMap(() =>
              (isAdmin
                ? this.productService.getAdminMeasurementStatus()
                : this.productService.getMeasurementStatus()
              ).pipe(
                catchError(() => of<AdminMeasurementStatusCard[]>([])),
              ),
            ),
          ),
        ),
      ),
    ]).pipe(
      map(([, statusCards]) => this.buildCards(statusCards)),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['products']) {
      this.products$.next(this.products ?? []);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.products$.complete();
    this.refresh$.complete();
  }

  protected onEdit(card: MeasurementCard): void {
    this.editingType = card.measurementType;
    this.editingValue = card.latestValue;
  }

  protected onCancelEdit(): void {
    this.editingType = null;
    this.editingValue = null;
  }

  protected isValidEdit(): boolean {
    if (this.editingValue === null || this.editingValue === undefined || Number.isNaN(this.editingValue)) {
      return false;
    }
    // Only temperature can go below zero.
    return this.editingType === 'TEMPERATURE' || this.editingValue >= 0;
  }

  protected onSave(card: MeasurementCard): void {
    if (this.saving || !this.isValidEdit()) {
      return;
    }

    this.saving = true;
    this.measurementService
      .setCurrentReading({
        measurementType: card.measurementType,
        value: Number(this.editingValue),
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => this.onSaveSuccess(card, result),
        error: error => {
          this.saving = false;
          this.toast.show({
            type: 'error',
            icon: '⚠️',
            title: 'Could not update the reading',
            message: httpErrorMessage(error),
          });
        },
      });
  }

  protected typeLabel(type: string): string {
    return measurementTypeLabel(type);
  }

  protected unitLabel(unit: string | null | undefined): string {
    return measurementUnitLabel(unit ?? '');
  }

  protected operatorSymbol(operator: string | null): string {
    return comparisonOperatorSymbol(operator);
  }

  protected formatValue(value: number | null): string {
    return formatThresholdValue(value);
  }

  protected stateLabel(state: LiveConditionState): string {
    return LIVE_CONDITION_STATE_LABELS[state];
  }

  protected stateColor(state: LiveConditionState): string {
    return `ms-pill ${LIVE_CONDITION_STATE_COLORS[state]}`;
  }

  protected themeFor(type: string): MeasurementTheme {
    return MEASUREMENT_THEMES[type] ?? DEFAULT_THEME;
  }

  protected progressColor(state: LiveConditionState, themeBar: string): string {
    if (state === 'THRESHOLD_EXCEEDED') return 'ms-progress-fill bg-danger-500';
    if (state === 'APPROACHING') return 'ms-progress-fill bg-warn-500';
    return `ms-progress-fill ${themeBar}`;
  }

  protected progressTextColor(state: LiveConditionState): string {
    if (state === 'THRESHOLD_EXCEEDED') return 'ms-progress-text text-danger-700';
    if (state === 'APPROACHING') return 'ms-progress-text text-warn-700';
    return 'ms-progress-text text-gray-500';
  }

  protected summarize(cards: MeasurementCard[]): {
    live: number;
    products: number;
    approaching: number;
    triggered: number;
  } {
    const rows = cards.flatMap(card => card.rows);
    return {
      live: cards.filter(card => card.latestValue !== null).length,
      products: new Set(rows.map(row => row.productId)).size,
      approaching: rows.filter(row => row.state === 'APPROACHING').length,
      triggered: rows.filter(row => row.state === 'THRESHOLD_EXCEEDED').length,
    };
  }

  protected lastUpdated(at: string | null): string {
    if (!at) {
      return '';
    }
    const diff = Date.now() - new Date(at).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) {
      return 'just now';
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} h ago`;
    }
    return new Date(at).toLocaleString();
  }

  private buildCards(
    statusCards: AdminMeasurementStatusCard[],
  ): MeasurementCard[] {
    const results: MeasurementCard[] = statusCards
      .filter(card => !!card.measurementType)
      .map(card => {
        const latestValue = card.currentValue ?? null;
        const rows: ProductThresholdRow[] = (card.products ?? []).map(product => ({
          productId: product.productId,
          productCode: product.productCode,
          productName: product.productName,
          threshold: product.thresholdValue ?? null,
          operator: product.comparisonOperator ?? null,
          unit: card.measurementUnit ?? null,
          ...this.rowState(
            latestValue,
            product.thresholdValue ?? null,
            product.comparisonOperator ?? null,
            !!product.triggered,
          ),
        }));

        return {
          measurementType: card.measurementType!,
          unit: card.measurementUnit ?? '',
          latestValue,
          observedAt: card.observedAt ?? null,
          source: card.source ?? null,
          state: this.cardState(latestValue, rows),
          rows,
        };
      });

    return results.sort((a, b) =>
      a.measurementType.localeCompare(b.measurementType),
    );
  }

  /**
   * Progress towards the trigger: for "at least" rules the value climbing up to the
   * threshold, for "below" rules (e.g. drought) the value falling down to it.
   */
  private rowState(
    latestValue: number | null,
    threshold: number | null,
    operator: string | null,
    triggered: boolean,
  ): { state: LiveConditionState; progress: number | null } {
    if (triggered) {
      return { state: 'THRESHOLD_EXCEEDED', progress: 100 };
    }
    if (latestValue === null || threshold === null || threshold <= 0) {
      return { state: latestValue === null ? 'NO_DATA' : 'NORMAL', progress: null };
    }
    const falling = operator === 'LESS_THAN' || operator === 'LESS_THAN_OR_EQUAL';
    const ratio = falling
      ? latestValue <= 0 ? 1 : threshold / latestValue
      : latestValue / threshold;
    const progress = Math.max(0, Math.min(100, Math.round(ratio * 100)));
    return {
      state: progress >= APPROACHING_PERCENT ? 'APPROACHING' : 'NORMAL',
      progress,
    };
  }

  private cardState(
    latestValue: number | null,
    rows: ProductThresholdRow[],
  ): LiveConditionState {
    if (latestValue === null || latestValue === undefined) {
      return 'NO_DATA';
    }
    if (rows.some(row => row.state === 'THRESHOLD_EXCEEDED')) {
      return 'THRESHOLD_EXCEEDED';
    }
    if (rows.some(row => row.state === 'APPROACHING')) {
      return 'APPROACHING';
    }
    return 'NORMAL';
  }

  private onSaveSuccess(card: MeasurementCard, result: ManualReadingResponse): void {
    this.saving = false;
    this.editingType = null;
    this.editingValue = null;
    const unit = this.unitLabel(card.unit);
    this.toast.show({
      type: 'success',
      icon: '✅',
      title: `${this.typeLabel(card.measurementType)} updated`,
      message:
        `Now ${this.formatValue(result.value)} ${unit} in ${result.zoneCount} ` +
        `zone${result.zoneCount === 1 ? '' : 's'}. The demo feed leaves it for ${result.holdMinutes} min.`,
    });
    this.refresh$.next();
  }
}
