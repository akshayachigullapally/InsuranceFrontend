import { AsyncPipe } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  BehaviorSubject,
  combineLatest,
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
import {
  LiveConditionState,
  ProductTriggerThresholdUpdateRequest,
  ProductTriggerThresholdUpdateResponse,
} from '../../../features/dtos/triggers/trigger-condition.dto';
import { MeasurementStatusEntry } from '../../../features/dtos/triggers/measurement-status.dto';
import { ProductService } from '../../../features/services/product.service';
import {
  updateProductThreshold,
  updateProductThresholdFailure,
  updateProductThresholdSuccess,
} from '../../../features/state/products/products.actions';
import {
  LIVE_CONDITION_STATE_COLORS,
  LIVE_CONDITION_STATE_LABELS,
  comparisonOperatorSymbol,
  formatThresholdValue,
  liveConditionState,
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
}

interface MeasurementCard {
  measurementType: string;
  unit: string;
  latestValue: number | null;
  observedAt: string | null;
  state: LiveConditionState;
  rows: ProductThresholdRow[];
}

const POLL_INTERVAL_MS = 10_000;

@Component({
  selector: 'app-measurement-status-panel',
  standalone: true,
  imports: [AsyncPipe, FormsModule, EmptyStateComponent],
  templateUrl: './measurement-status-panel.component.html',
  styleUrl: './measurement-status-panel.component.css',
})
export class MeasurementStatusPanelComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() products: ProductResponse[] | null = [];

  readonly cards$: Observable<MeasurementCard[]>;

  protected editingProductId: number | null = null;
  protected editingValue: number | null = null;
  protected saving = false;

  private readonly products$ = new BehaviorSubject<ProductResponse[]>([]);
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly store: Store,
    private readonly actions$: Actions,
    private readonly productService: ProductService,
    private readonly toast: ToastService,
  ) {
    this.cards$ = combineLatest([
      this.products$,
      timer(0, POLL_INTERVAL_MS).pipe(
        switchMap(() =>
          this.productService.getAdminMeasurementStatus().pipe(
            catchError(() => of({ entries: [] })),
          ),
        ),
      ),
    ]).pipe(
      map(([products, status]) =>
        this.buildCards(products, status.entries),
      ),
    );
  }

  ngOnInit(): void {
    this.actions$
      .pipe(
        ofType(updateProductThresholdSuccess),
        takeUntil(this.destroy$),
      )
      .subscribe(({ result }) => this.onUpdateSuccess(result));

    this.actions$
      .pipe(
        ofType(updateProductThresholdFailure),
        takeUntil(this.destroy$),
      )
      .subscribe(({ error }) => this.onUpdateFailure(error));
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
  }

  protected onEdit(row: ProductThresholdRow): void {
    this.editingProductId = row.productId;
    this.editingValue = row.threshold;
  }

  protected onCancelEdit(): void {
    this.editingProductId = null;
    this.editingValue = null;
  }

  protected onSave(card: MeasurementCard): void {
    const product = this.products?.find(
      p => p.id === this.editingProductId,
    );
    if (
      !product ||
      this.saving ||
      this.editingValue === null ||
      this.editingValue <= 0
    ) {
      return;
    }

    const request: ProductTriggerThresholdUpdateRequest = {
      perilCode: product.perilCode ?? '',
      measurementType: product.measurementType ?? 'RAINFALL',
      measurementUnit: product.measurementUnit ?? 'MM',
      thresholdValue: Number(this.editingValue),
      comparisonOperator:
        product.comparisonOperator ?? 'GREATER_THAN_OR_EQUAL',
      aggregationType: product.aggregationType ?? 'AVERAGE',
      observationWindowHours: product.observationWindowHours ?? 24,
      minimumObservationCount: product.minimumObservationCount ?? 2,
      triggerDescription: product.triggerDescription?.trim() || undefined,
      changeReason: 'Updated from admin measurement header',
    };

    this.saving = true;
    this.store.dispatch(
      updateProductThreshold({ productId: product.id, request }),
    );
  }

  protected isValidEdit(): boolean {
    return (
      this.editingValue !== null &&
      this.editingValue !== undefined &&
      this.editingValue > 0
    );
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
    return LIVE_CONDITION_STATE_COLORS[state];
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
    products: ProductResponse[],
    entries: MeasurementStatusEntry[],
  ): MeasurementCard[] {
    const cards = new Map<string, MeasurementCard>();

    for (const entry of entries) {
      if (!entry.measurementType) {
        continue;
      }
      cards.set(entry.measurementType, {
        measurementType: entry.measurementType,
        unit: entry.measurementUnit ?? '',
        latestValue: entry.latestValue ?? null,
        observedAt: entry.observedAt ?? null,
        state: 'NO_DATA',
        rows: [],
      });
    }

    for (const product of products) {
      const type = product.measurementType;
      if (!type) {
        continue;
      }
      const card =
        cards.get(type) ?? {
          measurementType: type,
          unit: product.measurementUnit ?? '',
          latestValue: null,
          observedAt: null,
          state: 'NO_DATA',
          rows: [],
        };
      if (!card.unit && product.measurementUnit) {
        card.unit = product.measurementUnit;
      }
      card.rows.push({
        productId: product.id,
        productCode: product.productCode,
        productName: product.name,
        threshold: product.thresholdValue ?? null,
        operator: product.comparisonOperator ?? null,
        unit: product.measurementUnit ?? null,
        state: 'NO_DATA',
      });
      cards.set(type, card);
    }

    const results = [...cards.values()];
    for (const card of results) {
      for (const row of card.rows) {
        row.state = liveConditionState(
          card.latestValue,
          row.threshold,
          row.operator,
        );
      }
      card.state = this.cardState(card.latestValue, card.rows);
    }

    return results.sort((a, b) =>
      a.measurementType.localeCompare(b.measurementType),
    );
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

  private onUpdateSuccess(
    result: ProductTriggerThresholdUpdateResponse,
  ): void {
    if (result.productId !== this.editingProductId) {
      return;
    }
    this.saving = false;
    this.editingProductId = null;
    this.editingValue = null;

    this.toast.show({
      type: 'success',
      icon: '✅',
      title: 'Threshold updated',
      message: this.buildResultMessage(result),
    });
  }

  private onUpdateFailure(error: string): void {
    this.saving = false;
    this.toast.show({
      type: 'error',
      icon: '⚠️',
      title: 'Threshold update failed',
      message: error,
    });
  }

  private buildResultMessage(
    result: ProductTriggerThresholdUpdateResponse,
  ): string {
    const parts: string[] = [];
    if (result.triggerSyncStatus === 'FAILED') {
      parts.push('Trigger sync failed on the backend.');
    }
    if (result.triggeredPolicyCount) {
      parts.push(
        `${result.triggeredPolicyCount} polic${
          result.triggeredPolicyCount === 1 ? 'y' : 'ies'
        } triggered.`,
      );
    }
    if (result.createdClaimCount) {
      parts.push(
        `${result.createdClaimCount} claim${
          result.createdClaimCount === 1 ? '' : 's'
        } created.`,
      );
    }
    if (parts.length === 0 && result.message) {
      return result.message;
    }
    return parts.join(' ') || 'The new threshold is now active.';
  }
}