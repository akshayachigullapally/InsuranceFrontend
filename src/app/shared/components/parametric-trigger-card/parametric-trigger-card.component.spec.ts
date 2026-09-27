import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParametricTriggerCardComponent } from './parametric-trigger-card.component';
import { TriggerCondition } from '../../../features/dtos/triggers/trigger-condition.dto';

describe('ParametricTriggerCardComponent', () => {
  let fixture: ComponentFixture<ParametricTriggerCardComponent>;
  let element: HTMLElement;

  const trigger: TriggerCondition = {
    measurementType: 'RAINFALL',
    measurementUnit: 'MM',
    thresholdValue: 150,
    comparisonOperator: 'GREATER_THAN_OR_EQUAL',
    humanReadableTrigger: 'Rainfall of 150 mm or more in 24 hours',
    triggerDescription: '  Heavy monsoon cover  ',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParametricTriggerCardComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ParametricTriggerCardComponent);
    element = fixture.nativeElement;
  });

  function render(inputs: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
  }

  it('shows a placeholder when no trigger is configured', () => {
    render({});

    expect(element.textContent).toContain('Trigger condition');
    expect(element.textContent).toContain('Trigger not configured yet.');
  });

  it('treats a trigger without a threshold as not configured', () => {
    render({ trigger: { measurementType: 'RAINFALL' } });

    expect(element.textContent).toContain('Trigger not configured yet.');
  });

  it('shows the metric label, sentence and trimmed description', () => {
    render({ trigger });

    expect(element.querySelector('.trigger-card-kicker')?.textContent).toContain('Rainfall');
    expect(element.querySelector('.trigger-card-sentence')?.textContent).toContain(
      'Rainfall of 150 mm or more in 24 hours',
    );
    expect(element.querySelector('.trigger-card-description')?.textContent?.trim()).toBe(
      'Heavy monsoon cover',
    );
  });

  it('prefers a custom title and marks policy snapshots', () => {
    render({ trigger, title: 'Policy trigger', mode: 'POLICY_SNAPSHOT' });

    expect(element.textContent).toContain('Policy trigger');
    expect(element.textContent).toContain('Snapshot');
  });

  it('does not show the live section outside LIVE mode', () => {
    render({ trigger, liveValue: 200 });

    expect(element.querySelector('.trigger-card-live')).toBeNull();
  });

  it('shows the zone and an exceeded state in LIVE mode', () => {
    render({ trigger, mode: 'LIVE', zoneName: 'Hyderabad Central Zone', liveValue: 180 });

    expect(element.textContent).toContain('Hyderabad Central Zone');
    expect(element.textContent).toContain('Threshold exceeded');
  });

  it('shows an approaching state when close to the threshold', () => {
    render({ trigger, mode: 'LIVE', liveValue: 140 });

    expect(element.textContent).toContain('Approaching threshold');
  });

  it('shows no live data when the live value is missing', () => {
    render({ trigger, mode: 'LIVE', liveValue: null });

    expect(element.textContent).toContain('No live value');
    expect(element.textContent).toContain('No live data');
  });

  it('uses an explicit live state when provided', () => {
    render({ trigger, mode: 'LIVE', liveValue: 10, liveState: 'THRESHOLD_EXCEEDED' });

    expect(element.textContent).toContain('Threshold exceeded');
  });
});
