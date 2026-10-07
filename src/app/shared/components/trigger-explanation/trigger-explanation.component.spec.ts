import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClaimResponse } from '../../../features/dtos/claims/claim-response.dto';
import { TriggerExplanationComponent } from './trigger-explanation.component';

function claim(overrides: Partial<ClaimResponse> = {}): ClaimResponse {
  return {
    id: 1,
    claimNumber: 'CLM-1',
    customerId: 1,
    policyId: 2,
    policyNumber: 'POL-1',
    productId: 3,
    locationZoneId: 4,
    incidentType: 'RAINFALL',
    incidentDate: '2026-09-20',
    incidentLocation: 'AUTO',
    description: 'auto',
    claimedAmount: 50000,
    status: 'SUBMITTED',
    submittedAt: '2026-09-20T10:00:00',
    updatedAt: '2026-09-20T10:00:00',
    triggerEventId: 9,
    triggerEventReference: 'TEV-9',
    createdFromTriggerEvent: true,
    triggerMeasurementType: 'RAINFALL',
    triggerMeasurementUnit: 'MM',
    triggerObservedValue: 162,
    triggerThresholdValue: 150,
    triggerComparisonOperator: 'GREATER_THAN_OR_EQUAL',
    triggerWindowStart: '2026-09-19T10:00:00',
    triggerWindowEnd: '2026-09-20T10:00:00',
    ...overrides,
  } as ClaimResponse;
}

describe('TriggerExplanationComponent', () => {
  let fixture: ComponentFixture<TriggerExplanationComponent>;

  async function render(value: ClaimResponse, zoneName: string | null = 'Hyderabad Central'): Promise<string> {
    await TestBed.configureTestingModule({ imports: [TriggerExplanationComponent] }).compileComponents();
    fixture = TestBed.createComponent(TriggerExplanationComponent);
    fixture.componentRef.setInput('claim', value);
    fixture.componentRef.setInput('zoneName', zoneName);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  it('explains the reading, the trigger and the payout', async () => {
    const text = await render(claim());

    expect(text).toContain('Rainfall reached 162 mm at Hyderabad Central');
    expect(text).toContain('≥ 150 mm');
    expect(text).toContain('Measured over 24 h');
    expect(text).toContain('Trigger condition met');
    expect(text).toContain('50,000');
  });

  it('falls back when the reading was not recorded', async () => {
    const text = await render(claim({ triggerObservedValue: null, triggerThresholdValue: null }));

    expect(text).toContain('TEV-9');
    expect(text).toContain('not recorded');
  });
});
