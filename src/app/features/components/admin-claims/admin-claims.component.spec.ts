import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { AdminClaimsComponent } from './admin-claims.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import { ZoneService } from '../../services/zone.service';
import { clearClaimsError, loadAdminClaims } from '../../state/claims/claims.actions';
import { ClaimStatus } from '../../dtos/claims/claim-response.dto';

type ClaimsInternals = {
  applyFilter(status: ClaimStatus | null): void;
  zoneLabel(zoneId: number): string;
  statusLabel(status: ClaimStatus): string;
  formatDateOnly(value?: string | null): string;
  selectedStatus: ClaimStatus | null;
};

describe('AdminClaimsComponent', () => {
  let fixture: ComponentFixture<AdminClaimsComponent>;
  let page: ClaimsInternals;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminClaimsComponent],
      providers: [
        ...pageTestProviders(),
        { provide: ZoneService, useValue: { getAllZones: () => of([{ id: 2, zoneName: 'Mumbai West Zone' }]) } },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(AdminClaimsComponent);
    page = fixture.componentInstance as unknown as ClaimsInternals;
    fixture.detectChanges();
  });

  it('loads all claims on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(clearClaimsError());
    expect(store.dispatch).toHaveBeenCalledWith(loadAdminClaims({}));
  });

  it('reloads claims with the chosen status', () => {
    page.applyFilter('UNDER_REVIEW');

    expect(page.selectedStatus).toBe('UNDER_REVIEW');
    expect(store.dispatch).toHaveBeenCalledWith(loadAdminClaims({ status: 'UNDER_REVIEW' }));
  });

  it('formats status labels in title case', () => {
    expect(page.statusLabel('UNDER_REVIEW')).toBe('Under Review');
  });

  it('formats date-only values without timezone shifts', () => {
    expect(page.formatDateOnly('2026-09-20')).toBe('Sep 20, 2026');
    expect(page.formatDateOnly(null)).toBe('Not available');
    expect(page.formatDateOnly('not a date')).toBe('Not available');
  });

  it('labels zones by name', () => {
    expect(page.zoneLabel(2)).toBe('Mumbai West Zone (Zone #2)');
  });
});
