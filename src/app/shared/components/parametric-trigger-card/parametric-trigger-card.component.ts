import { Component, computed, input } from '@angular/core';
import {
  LiveConditionState,
  TriggerCondition,
} from '../../../features/dtos/triggers/trigger-condition.dto';
import {
  LIVE_CONDITION_STATE_COLORS,
  LIVE_CONDITION_STATE_LABELS,
  buildTriggerSentence,
  formatThresholdValue,
  hasTriggerCondition,
  liveConditionState,
  liveConditionProgress,
  measurementTypeLabel,
  measurementUnitLabel,
  triggerSyncStatusColor,
  triggerSyncStatusLabel,
} from '../../../features/utils/trigger-display';

export type ParametricTriggerCardMode =
  | 'PRODUCT'
  | 'POLICY_SNAPSHOT'
  | 'LIVE'
  | 'STATIC';

@Component({
  selector: 'app-parametric-trigger-card',
  standalone: true,
  templateUrl: './parametric-trigger-card.component.html',
  styleUrl: './parametric-trigger-card.component.css',
})
export class ParametricTriggerCardComponent {
  readonly trigger = input<TriggerCondition | null>(null);
  readonly mode = input<ParametricTriggerCardMode>('STATIC');
  readonly title = input<string>('');
  readonly zoneName = input<string>('');
  readonly liveValue = input<number | null>(null);
  readonly liveState = input<LiveConditionState | null>(null);
  readonly syncStatus = input<string | null | undefined>(null);
  readonly syncMessage = input<string | null>(null);

  protected readonly configured = computed(() =>
    hasTriggerCondition(this.trigger()),
  );

  protected readonly metricLabel = computed(() =>
    measurementTypeLabel(this.trigger()?.measurementType),
  );

  protected readonly unitLabel = computed(() =>
    measurementUnitLabel(this.trigger()?.measurementUnit),
  );

  protected readonly resolvedLiveState = computed(() => {
    const incoming = this.liveState();
    if (incoming) return incoming;
    return liveConditionState(
      this.liveValue(),
      this.trigger()?.thresholdValue,
      this.trigger()?.comparisonOperator,
    );
  });

  protected readonly liveProgress = computed(() => {
    if (this.mode() !== 'LIVE') return { percent: 0, color: 'bg-brand-500' };
    const value = this.liveValue();
    const threshold = this.trigger()?.thresholdValue;
    if (value === null || value === undefined) {
      return { percent: 0, color: 'bg-gray-200' };
    }
    return liveConditionProgress({
      zoneId: 0,
      condition: this.trigger() ?? {},
      liveValue: value,
      state: this.resolvedLiveState(),
    });
  });

  protected readonly stateLabel = computed(
    () => LIVE_CONDITION_STATE_LABELS[this.resolvedLiveState()],
  );

  protected readonly stateColor = computed(
    () => LIVE_CONDITION_STATE_COLORS[this.resolvedLiveState()],
  );

  protected readonly syncColor = computed(() =>
    triggerSyncStatusColor(this.syncStatus()),
  );

  protected readonly syncLabel = computed(() =>
    triggerSyncStatusLabel(this.syncStatus()),
  );

  protected readonly showSync = computed(() => this.mode() === 'PRODUCT');

  protected readonly description = computed(() =>
    this.trigger()?.triggerDescription?.trim() ?? '',
  );

  protected buildSentence(): string {
    return buildTriggerSentence(this.trigger() ?? {});
  }

  protected liveValueText(): string {
    const value = this.liveValue();
    if (value === null || value === undefined) return 'No live value';
    const unit = this.unitLabel();
    return `${formatThresholdValue(value)}${unit ? ' ' + unit : ''}`;
  }
}