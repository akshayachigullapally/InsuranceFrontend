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
import { AdminMeasurementStatusCard } from '../../../features/dtos/triggers/measurement-status.dto';
import { ProductService } from '../../../features/services/product.service';
import { ROLES } from '../../../core/constants/roles';
import { selectAuthUser } from '../../../features/state/auth/auth.selectors';
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
  protected readonly isAdmin$: Observable<boolean>;

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
    this.isAdmin$ = this.store.select(selectAuthUser).pipe(
      map(user => user?.role === ROLES.ADMIN),
    );

    this.cards$ = combineLatest([
      this.products$,
      this.isAdmin$.pipe(
        switchMap(isAdmin =>
          timer(0, POLL_INTERVAL_MS).pipe(
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
          state: product.triggered
            ? 'THRESHOLD_EXCEEDED'
            : latestValue === null
              ? 'NO_DATA'
              : 'NORMAL',
        }));

        return {
          measurementType: card.measurementType!,
          unit: card.measurementUnit ?? '',
          latestValue,
          observedAt: card.observedAt ?? null,
          state: this.cardState(latestValue, rows),
          rows,
        };
      });

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