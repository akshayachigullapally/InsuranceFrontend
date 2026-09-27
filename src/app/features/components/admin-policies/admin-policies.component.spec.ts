import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { AdminPoliciesComponent } from './admin-policies.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import { ZoneService } from '../../services/zone.service';
import { clearPoliciesError, loadAdminPolicies } from '../../state/policies/policies.actions';
import { PolicyStatus } from '../../dtos/policies/policy-response.dto';

type PoliciesInternals = {
  applyFilter(status: PolicyStatus | null): void;
  zoneLabel(zoneId: number): string;
  statusLabel(status: PolicyStatus): string;
  filters: { label: string; value: PolicyStatus | null }[];
  selectedStatus: PolicyStatus | null;
};

describe('AdminPoliciesComponent', () => {
  let fixture: ComponentFixture<AdminPoliciesComponent>;
  let page: PoliciesInternals;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPoliciesComponent],
      providers: [
        ...pageTestProviders(),
        { provide: ZoneService, useValue: { getAllZones: () => of([{ id: 3, zoneName: 'Pune Test Zone' }]) } },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(AdminPoliciesComponent);
    page = fixture.componentInstance as unknown as PoliciesInternals;
    fixture.detectChanges();
  });

  it('loads all policies on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(clearPoliciesError());
    expect(store.dispatch).toHaveBeenCalledWith(loadAdminPolicies({}));
  });

  it('builds a filter chip for every status plus All', () => {
    expect(page.filters[0]).toEqual({ label: 'All', value: null });
    expect(page.filters.map((filter) => filter.label)).toContain('Pending');
  });

  it('reloads with the chosen status', () => {
    page.applyFilter('REJECTED');

    expect(page.selectedStatus).toBe('REJECTED');
    expect(store.dispatch).toHaveBeenCalledWith(loadAdminPolicies({ status: 'REJECTED' }));
  });

  it('labels zones including archived ones from getAllZones', () => {
    expect(page.zoneLabel(3)).toBe('Pune Test Zone (Zone #3)');
    expect(page.zoneLabel(4)).toBe('Zone #4');
  });

  it('formats status labels', () => {
    expect(page.statusLabel('CANCELLED')).toBe('Cancelled');
  });
});
