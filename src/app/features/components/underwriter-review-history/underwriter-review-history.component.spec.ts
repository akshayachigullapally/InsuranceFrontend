import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Signal, WritableSignal } from '@angular/core';
import { of } from 'rxjs';
import { UnderwriterReviewHistoryComponent } from './underwriter-review-history.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import { PolicyService } from '../../services/policy.service';

type HistoryInternals = {
  entries: Signal<unknown[]>;
  loading: Signal<boolean>;
  error: Signal<string | null>;
  search: WritableSignal<string>;
  decision: WritableSignal<'' | 'APPROVED' | 'REJECTED'>;
  approvedCount: Signal<number>;
  rejectedCount: Signal<number>;
  approvedCover: Signal<number>;
  filtered: Signal<{ policyNumber: string }[]>;
  clearFilters(): void;
  humanize(value: string | null | undefined): string;
};

const entries = [
  { historyId: 1, policyNumber: 'POL-1', productName: 'Rain Cover', productCode: 'WEATHER-001', decision: 'APPROVED', sumInsured: 100000, customerId: 7 },
  { historyId: 2, policyNumber: 'POL-2', productName: 'Flood Cover', productCode: 'FLOOD-001', decision: 'REJECTED', sumInsured: 50000, customerId: 8, reason: 'High risk zone' },
  { historyId: 3, policyNumber: 'POL-3', productName: 'Rain Cover', productCode: 'WEATHER-001', decision: 'APPROVED', sumInsured: 25000, customerId: 9 },
];

async function setup(response = of(entries) as ReturnType<PolicyService['getReviewHistory']>) {
  await TestBed.configureTestingModule({
    imports: [UnderwriterReviewHistoryComponent],
    providers: [
      ...pageTestProviders(),
      { provide: PolicyService, useValue: { getReviewHistory: vi.fn().mockReturnValue(response) } },
    ],
  }).compileComponents();

  const fixture: ComponentFixture<UnderwriterReviewHistoryComponent> =
    TestBed.createComponent(UnderwriterReviewHistoryComponent);
  fixture.detectChanges();
  return { fixture, page: fixture.componentInstance as unknown as HistoryInternals };
}

describe('UnderwriterReviewHistoryComponent', () => {
  it('loads the review history on init', async () => {
    const { page } = await setup();

    expect(page.entries().length).toBe(3);
    expect(page.loading()).toBe(false);
  });

  it('filters by decision and search term', async () => {
    const { page } = await setup();

    page.decision.set('APPROVED');
    expect(page.filtered().map((entry) => entry.policyNumber)).toEqual(['POL-1', 'POL-3']);

    page.decision.set('');
    page.search.set('high risk');
    expect(page.filtered().map((entry) => entry.policyNumber)).toEqual(['POL-2']);

    page.clearFilters();
    expect(page.filtered().length).toBe(3);
  });
});
