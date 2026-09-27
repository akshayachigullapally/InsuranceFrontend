import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { firstValueFrom } from 'rxjs';
import { ClaimsOfficerDashboardComponent } from './claims-officer-dashboard.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { clearClaimsError, loadSubmittedClaims } from '../../state/claims/claims.actions';
import { loadTriggerEvents } from '../../state/trigger-events/trigger-events.actions';

describe('ClaimsOfficerDashboardComponent', () => {
  let fixture: ComponentFixture<ClaimsOfficerDashboardComponent>;
  let component: ClaimsOfficerDashboardComponent;
  let store: MockStore;

  beforeEach(async () => {
    const root = mockRootState();
    await TestBed.configureTestingModule({
      imports: [ClaimsOfficerDashboardComponent],
      providers: pageTestProviders({
        claims: {
          ...root.claims,
          submittedClaims: [
            { id: 1, claimNumber: 'CLM-1', status: 'SUBMITTED', claimedAmount: 1000, triggerEventId: null },
            { id: 2, claimNumber: 'CLM-2', status: 'SUBMITTED', claimedAmount: 2001, triggerEventId: 9 },
          ],
        },
        triggerEvents: {
          ...root.triggerEvents,
          events: [
            { id: 1, status: 'DETECTED' },
            { id: 2, status: 'VERIFIED' },
            { id: 3, status: 'REJECTED' },
          ],
        },
      }),
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(ClaimsOfficerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the review queue and trigger events on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(clearClaimsError());
    expect(store.dispatch).toHaveBeenCalledWith(loadSubmittedClaims());
    expect(store.dispatch).toHaveBeenCalledWith(loadTriggerEvents());
  });

  it('counts manual claims (no trigger event)', async () => {
    expect(await firstValueFrom(component.manualClaimCount$)).toBe(1);
  });

  it('computes the rounded average claim amount', async () => {
    expect(await firstValueFrom(component.averageClaimAmount$)).toBe(1500.5);
  });

  it('counts only active trigger events', async () => {
    expect(await firstValueFrom(component.activeTriggerCount$)).toBe(2);
  });

  it('refreshes the queue when the window regains focus', () => {
    vi.mocked(store.dispatch).mockClear();

    window.dispatchEvent(new Event('focus'));

    expect(store.dispatch).toHaveBeenCalledWith(loadSubmittedClaims());
    expect(store.dispatch).toHaveBeenCalledWith(loadTriggerEvents());
  });
});
