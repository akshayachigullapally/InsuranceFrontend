import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ClaimResponse } from '../../../features/dtos/claims/claim-response.dto';
import {
  comparisonOperatorSymbol,
  formatThresholdValue,
  measurementTypeLabel,
  measurementUnitLabel,
} from '../../../features/utils/trigger-display';

type Outcome = 'pending' | 'approved' | 'paid' | 'rejected' | 'cancelled';

/**
 * Explains an automatic (parametric) claim: what was measured in the
 * customer's zone, what the policy trigger was, and what is paid.
 * Renders nothing for manual claims.
 */
@Component({
  selector: 'app-trigger-explanation',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    @if (isTriggerClaim()) {
      <div class="rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold tracking-widest text-brand-600 uppercase">
              {{ audience() === 'staff' ? 'Trigger evidence' : 'Why this claim was created' }}
            </p>
            <h3 class="mt-1 text-lg font-bold text-gray-900">
              {{ headline() }}
            </h3>
          </div>
          @if (hasReading()) {
            <span
              class="rounded-full px-3 py-1 text-xs font-semibold"
              [class]="conditionMet() ? 'bg-success-50 text-success-700' : 'bg-warn-50 text-warn-700'"
            >
              {{ conditionMet() ? 'Trigger condition met' : 'Condition not met' }}
            </span>
          }
        </div>

        @if (hasReading()) {
          <dl class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div class="rounded-xl bg-white p-4">
              <dt class="text-xs font-medium text-gray-500">
                {{ measurement() }} at {{ zoneLabel() }}
              </dt>
              <dd class="mt-1 text-xl font-bold text-gray-900">
                {{ observedText() }}
              </dd>
              @if (windowText(); as window) {
                <p class="mt-0.5 text-xs text-gray-500">{{ window }}</p>
              }
            </div>
            <div class="rounded-xl bg-white p-4">
              <dt class="text-xs font-medium text-gray-500">Your policy trigger</dt>
              <dd class="mt-1 text-xl font-bold text-gray-900">{{ thresholdText() }}</dd>
              <p class="mt-0.5 text-xs text-gray-500">Locked when the policy was issued</p>
            </div>
            <div class="rounded-xl bg-white p-4">
              <dt class="text-xs font-medium text-gray-500">{{ payoutLabel() }}</dt>
              <dd class="mt-1 text-xl font-bold" [class]="outcome() === 'rejected' || outcome() === 'cancelled' ? 'text-gray-400 line-through' : 'text-success-700'">
                ₹ {{ payoutAmount() | number: '1.0-2' }}
              </dd>
              <p class="mt-0.5 text-xs text-gray-500">{{ payoutNote() }}</p>
            </div>
          </dl>

          <div class="mt-4" aria-hidden="true">
            <div class="relative h-2.5 rounded-full bg-white">
              <div
                class="h-2.5 rounded-full"
                [class]="conditionMet() ? 'bg-success-500' : 'bg-warn-500'"
                [style.width.%]="observedPercent()"
              ></div>
              <div
                class="absolute -top-1 h-4.5 w-0.5 bg-gray-800"
                [style.left.%]="thresholdPercent()"
                title="Trigger threshold"
              ></div>
            </div>
            <div class="mt-1 flex justify-between text-[11px] text-gray-500">
              <span>0</span>
              <span>Threshold {{ thresholdText() }}</span>
            </div>
          </div>
        } @else {
          <p class="mt-3 text-sm text-gray-700">
            This claim was created automatically from verified trigger event
            <span class="font-semibold">{{ claim().triggerEventReference || '#' + claim().triggerEventId }}</span>
            in your insured zone. The exact reading was not recorded on this claim.
          </p>
        }

        <p class="mt-4 text-xs leading-5 text-gray-600">
          This is parametric cover: it pays because the measured value crossed your policy's
          trigger in your zone, not because of a damage assessment. A claims officer verifies the
          reading before the payout is released.
        </p>
      </div>
    }
  `,
})
export class TriggerExplanationComponent {
  readonly claim = input.required<ClaimResponse>();
  readonly zoneName = input<string | null>(null);
  readonly audience = input<'customer' | 'staff'>('customer');

  protected readonly isTriggerClaim = computed(() => {
    const claim = this.claim();
    return !!claim.triggerEventId || !!claim.createdFromTriggerEvent ||
      claim.claimSource === 'AUTO_TRIGGERED';
  });

  protected readonly hasReading = computed(() => {
    const claim = this.claim();
    return isNumber(claim.triggerObservedValue) && isNumber(claim.triggerThresholdValue);
  });

  protected readonly unit = computed(() => measurementUnitLabel(this.claim().triggerMeasurementUnit));

  protected readonly measurement = computed(() =>
    measurementTypeLabel(this.claim().triggerMeasurementType ?? this.claim().incidentType));

  protected readonly zoneLabel = computed(() => this.zoneName() || 'your zone');

  protected readonly observedText = computed(() =>
    `${formatThresholdValue(this.claim().triggerObservedValue)} ${this.unit()}`.trim());

  protected readonly thresholdText = computed(() => {
    const symbol = comparisonOperatorSymbol(this.claim().triggerComparisonOperator ?? 'GREATER_THAN_OR_EQUAL');
    return `${symbol} ${formatThresholdValue(this.claim().triggerThresholdValue)} ${this.unit()}`.trim();
  });

  protected readonly conditionMet = computed(() => {
    const claim = this.claim();
    const observed = Number(claim.triggerObservedValue);
    const threshold = Number(claim.triggerThresholdValue);
    switch (claim.triggerComparisonOperator ?? 'GREATER_THAN_OR_EQUAL') {
      case 'GREATER_THAN': return observed > threshold;
      case 'LESS_THAN': return observed < threshold;
      case 'LESS_THAN_OR_EQUAL': return observed <= threshold;
      case 'EQUAL': return observed === threshold;
      default: return observed >= threshold;
    }
  });

  protected readonly windowText = computed(() => {
    const claim = this.claim();
    if (!claim.triggerWindowStart || !claim.triggerWindowEnd) {
      return null;
    }
    const start = new Date(claim.triggerWindowStart).getTime();
    const end = new Date(claim.triggerWindowEnd).getTime();
    const hours = Math.round((end - start) / 3_600_000);
    return hours > 0 ? `Measured over ${hours} h` : null;
  });

  protected readonly outcome = computed<Outcome>(() => {
    switch (this.claim().status) {
      case 'APPROVED': return 'approved';
      case 'SETTLED': return 'paid';
      case 'REJECTED': return 'rejected';
      case 'CANCELLED': return 'cancelled';
      default: return 'pending';
    }
  });

  protected readonly payoutAmount = computed(() =>
    this.claim().approvedAmount ?? this.claim().claimedAmount);

  protected readonly payoutLabel = computed(() => {
    switch (this.outcome()) {
      case 'approved': return 'Approved payout';
      case 'paid': return 'Payout';
      case 'rejected':
      case 'cancelled': return 'No payout';
      default: return 'Payout due';
    }
  });

  protected readonly payoutNote = computed(() => {
    switch (this.outcome()) {
      case 'approved': return 'Approved; the transfer is being processed';
      case 'paid': return 'Paid to you';
      case 'rejected': return 'The claim was rejected after verification';
      case 'cancelled': return 'The claim was cancelled';
      default: return 'Your sum insured, paid after verification';
    }
  });

  protected readonly headline = computed(() => {
    if (!this.hasReading()) {
      return 'Automatic claim from a verified trigger';
    }
    return `${this.measurement()} reached ${this.observedText()} at ${this.zoneLabel()}`;
  });

  /** Scale so the larger of reading / threshold sits at ~85% of the bar. */
  private readonly scale = computed(() => {
    const claim = this.claim();
    const max = Math.max(Number(claim.triggerObservedValue) || 0, Number(claim.triggerThresholdValue) || 0);
    return max > 0 ? max / 0.85 : 1;
  });

  protected readonly observedPercent = computed(() =>
    Math.min(100, ((Number(this.claim().triggerObservedValue) || 0) / this.scale()) * 100));

  protected readonly thresholdPercent = computed(() =>
    Math.min(100, ((Number(this.claim().triggerThresholdValue) || 0) / this.scale()) * 100));
}

function isNumber(value: unknown): boolean {
  return value !== null && value !== undefined && !Number.isNaN(Number(value));
}
