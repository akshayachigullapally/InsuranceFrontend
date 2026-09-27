import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { ClaimsOfficerClaimsComponent } from './claims-officer-claims.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import { ZoneService } from '../../services/zone.service';
import { clearClaimsError, loadSubmittedClaims } from '../../state/claims/claims.actions';
import { ClaimResponse } from '../../dtos/claims/claim-response.dto';

type QueueInternals = {
  averageClaimAmount(claims: ClaimResponse[]): number;
  incidentLabel(type: string): string;
  triggerReference(claim: ClaimResponse): string;
  triggerEventLabel(claim: ClaimResponse): string;
  formatDateOnly(value?: string | null): string;
  zoneLabel(zoneId: number): string;
};

describe('ClaimsOfficerClaimsComponent', () => {
  let page: QueueInternals;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimsOfficerClaimsComponent],
      providers: [
        ...pageTestProviders(),
        { provide: ZoneService, useValue: { getActiveZones: () => of([{ id: 1, zoneName: 'Delhi North Zone' }]) } },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    const fixture: ComponentFixture<ClaimsOfficerClaimsComponent> =
      TestBed.createComponent(ClaimsOfficerClaimsComponent);
    page = fixture.componentInstance as unknown as QueueInternals;
    fixture.detectChanges();
  });

  it('loads the submitted claims queue on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(clearClaimsError());
    expect(store.dispatch).toHaveBeenCalledWith(loadSubmittedClaims());
  });

  it('averages the claimed amount', () => {
    const claims = [{ claimedAmount: 100 }, { claimedAmount: 250 }] as ClaimResponse[];

    expect(page.averageClaimAmount(claims)).toBe(175);
    expect(page.averageClaimAmount([])).toBe(0);
  });

  it('describes the trigger for automatic and manual claims', () => {
    const automatic = { triggerEventId: 12, triggerEventReference: 'EVT-12' } as ClaimResponse;
    const manual = { manualReviewRequired: true } as ClaimResponse;
    const unknown = { triggerEventId: null } as ClaimResponse;

    expect(page.triggerReference(automatic)).toBe('EVT-12');
    expect(page.triggerEventLabel(automatic)).toBe('Event #12');
    expect(page.triggerReference(manual)).toBe('Manual review');
    expect(page.triggerEventLabel(manual)).toBe('Pending validation');
    expect(page.triggerEventLabel(unknown)).toBe('Not available');
  });

  it('formats incident labels and dates', () => {
    expect(page.incidentLabel('HIGH_WIND')).toBe('High Wind');
    expect(page.formatDateOnly('2026-01-05')).toBe('Jan 5, 2026');
  });

  it('labels zones by name', () => {
    expect(page.zoneLabel(1)).toBe('Delhi North Zone (Zone #1)');
  });
});
