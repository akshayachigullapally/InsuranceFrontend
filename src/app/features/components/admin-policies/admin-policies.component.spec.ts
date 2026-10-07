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

  it('reloads with the chosen status', () => {
    page.applyFilter('REJECTED');

    expect(page.selectedStatus).toBe('REJECTED');
    expect(store.dispatch).toHaveBeenCalledWith(loadAdminPolicies({ status: 'REJECTED' }));
  });
});
