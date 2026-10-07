import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { UnderwriterPoliciesComponent } from './underwriter-policies.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { ZoneService } from '../../services/zone.service';
import { clearPoliciesError, loadReviewPolicies } from '../../state/policies/policies.actions';
import { PolicyResponse } from '../../dtos/policies/policy-response.dto';

type QueueInternals = {
  zoneLabel(zoneId: number): string;
  totalSumInsured(policies: PolicyResponse[]): number;
  averagePremium(policies: PolicyResponse[]): number;
};

describe('UnderwriterPoliciesComponent', () => {
  let fixture: ComponentFixture<UnderwriterPoliciesComponent>;
  let page: QueueInternals;
  let store: MockStore;
  const policies = [
    { id: 1, policyNumber: 'POL-0001', status: 'PENDING', sumInsured: 100000, premiumAmount: 1000, locationZoneId: 1 },
    { id: 2, policyNumber: 'POL-0002', status: 'PENDING', sumInsured: 50000, premiumAmount: 501, locationZoneId: 1 },
  ] as PolicyResponse[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnderwriterPoliciesComponent],
      providers: [
        ...pageTestProviders({ policies: { ...mockRootState().policies, reviewPolicies: policies } }),
        { provide: ZoneService, useValue: { getActiveZones: () => of([{ id: 1, zoneName: 'Hyderabad Central Zone' }]) } },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(UnderwriterPoliciesComponent);
    page = fixture.componentInstance as unknown as QueueInternals;
    fixture.detectChanges();
  });

  it('loads the pending review queue on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(clearPoliciesError());
    expect(store.dispatch).toHaveBeenCalledWith(loadReviewPolicies());
  });

  it('averages the premium to two decimals and handles an empty queue', () => {
    expect(page.averagePremium(policies)).toBe(750.5);
    expect(page.averagePremium([])).toBe(0);
  });
});
