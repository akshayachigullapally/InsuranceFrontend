import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Signal, WritableSignal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ClaimsOfficerReviewHistoryComponent } from './claims-officer-review-history.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import { ClaimService } from '../../services/claim.service';

type HistoryInternals = {
  entries: Signal<unknown[]>;
  loading: Signal<boolean>;
  error: Signal<string | null>;
  search: WritableSignal<string>;
  action: WritableSignal<string>;
  claimsHandled: Signal<number>;
  approvedCount: Signal<number>;
  rejectedCount: Signal<number>;
  settledCount: Signal<number>;
  approvedAmount: Signal<number>;
  filtered: Signal<{ claimNumber: string }[]>;
  clearFilters(): void;
  actionLabel(action: string): string;
  actionTone(action: string): string;
};

const entries = [
  { timelineId: 1, claimId: 1, claimNumber: 'CLM-1', policyNumber: 'POL-1', action: 'REVIEW_STARTED', customerId: 7, currentStatus: 'SETTLED' },
  { timelineId: 2, claimId: 1, claimNumber: 'CLM-1', policyNumber: 'POL-1', action: 'CLAIM_APPROVED', approvedAmount: 9000, customerId: 7, currentStatus: 'SETTLED' },
  { timelineId: 3, claimId: 2, claimNumber: 'CLM-2', policyNumber: 'POL-2', action: 'CLAIM_REJECTED', notes: 'Duplicate claim', customerId: 8, currentStatus: 'REJECTED' },
  { timelineId: 4, claimId: 3, claimNumber: 'CLM-3', policyNumber: 'POL-3', action: 'CLAIM_SETTLED', customerId: 9, currentStatus: 'SETTLED' },
];

async function setup(response: Observable<unknown> = of(entries)) {
  await TestBed.configureTestingModule({
    imports: [ClaimsOfficerReviewHistoryComponent],
    providers: [
      ...pageTestProviders(),
      { provide: ClaimService, useValue: { getReviewHistory: vi.fn().mockReturnValue(response) } },
    ],
  }).compileComponents();

  const fixture: ComponentFixture<ClaimsOfficerReviewHistoryComponent> =
    TestBed.createComponent(ClaimsOfficerReviewHistoryComponent);
  fixture.detectChanges();
  return fixture.componentInstance as unknown as HistoryInternals;
}

describe('ClaimsOfficerReviewHistoryComponent', () => {
  it('loads the history and counts distinct claims', async () => {
    const page = await setup();

    expect(page.entries().length).toBe(4);
    expect(page.claimsHandled()).toBe(3);
  });

  it('counts handled claims that are now settled, including ones settled by their payout', async () => {
    const page = await setup();

    // CLM-1 was approved by the officer and settled automatically; CLM-3 was settled manually.
    expect(page.settledCount()).toBe(2);
    expect(page.approvedCount()).toBe(1);
    expect(page.rejectedCount()).toBe(1);
  });

  it('filters by action and search term', async () => {
    const page = await setup();

    page.action.set('CLAIM_SETTLED');
    expect(page.filtered().map((entry) => entry.claimNumber)).toEqual(['CLM-3']);

    page.action.set('');
    page.search.set('duplicate');
    expect(page.filtered().map((entry) => entry.claimNumber)).toEqual(['CLM-2']);

    page.clearFilters();
    expect(page.filtered().length).toBe(4);
  });
});
