import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { CustomerPoliciesComponent } from './customer-policies.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { ZoneService } from '../../services/zone.service';
import { loadMyPolicies } from '../../state/policies/policies.actions';
import { PolicyStatus } from '../../dtos/policies/policy-response.dto';

type PoliciesInternals = {
  applyFilter(status: PolicyStatus | null): void;
  zoneLabel(zoneId: number): string;
  activeFilter: PolicyStatus | null;
};

describe('CustomerPoliciesComponent', () => {
  let fixture: ComponentFixture<CustomerPoliciesComponent>;
  let page: PoliciesInternals;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerPoliciesComponent],
      providers: [
        ...pageTestProviders({
          policies: {
            ...mockRootState().policies,
            myPolicies: [{ id: 1, policyNumber: 'POL-0001', status: 'ACTIVE', locationZoneId: 2, sumInsured: 100000 }],
          },
        }),
        { provide: ZoneService, useValue: { getActiveZones: () => of([{ id: 2, zoneName: 'Hyderabad Central Zone' }]) } },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(CustomerPoliciesComponent);
    page = fixture.componentInstance as unknown as PoliciesInternals;
    fixture.detectChanges();
  });

  it('loads my policies on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(loadMyPolicies({}));
  });

  it('renders my policies', () => {
    expect(fixture.nativeElement.textContent).toContain('POL-0001');
  });

  it('reloads policies with the chosen status filter', () => {
    page.applyFilter('ACTIVE');

    expect(page.activeFilter).toBe('ACTIVE');
    expect(store.dispatch).toHaveBeenCalledWith(loadMyPolicies({ status: 'ACTIVE' }));
  });

  it('clears the status filter for All', () => {
    page.applyFilter(null);

    expect(store.dispatch).toHaveBeenCalledWith(loadMyPolicies({ status: undefined }));
  });

  it('labels zones by name when known and by id otherwise', () => {
    expect(page.zoneLabel(2)).toBe('Hyderabad Central Zone (Zone #2)');
    expect(page.zoneLabel(99)).toBe('Zone #99');
  });
});
