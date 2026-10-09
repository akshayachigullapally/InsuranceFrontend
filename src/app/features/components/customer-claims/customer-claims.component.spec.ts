import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Subject, of } from 'rxjs';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { mergeNewNotifications } from '../../state/notifications/notifications.actions';
import { NotificationResponse } from '../../dtos/notifications/notification-response.dto';
import { CustomerClaimsComponent } from './customer-claims.component';
import { ZoneService } from '../../services/zone.service';
import { ClaimResponse } from '../../dtos/claims/claim-response.dto';
import { clearClaimsError, loadMyClaims } from '../../state/claims/claims.actions';
import {
  selectClaimsError,
  selectClaimsLoading,
  selectMyApprovedAmount,
  selectMyApprovedClaimCount,
  selectMyClaims,
  selectMySubmittedClaimCount,
} from '../../state/claims/claims.selectors';

function makeClaim(overrides: Partial<ClaimResponse> = {}): ClaimResponse {
  return {
    id: 1,
    claimNumber: 'CLM-0001',
    customerId: 7,
    policyId: 3,
    policyNumber: 'POL-0003',
    productId: 1,
    locationZoneId: 2,
    incidentType: 'EXCESS_RAINFALL',
    incidentDate: '2026-09-20',
    incidentLocation: 'Gachibowli',
    description: 'Crop damage',
    claimedAmount: 25000,
    approvedAmount: null,
    status: 'SUBMITTED',
    submittedAt: '2026-09-21T10:00:00',
    updatedAt: '2026-09-21T10:00:00',
    ...overrides,
  };
}

describe('CustomerClaimsComponent', () => {
  let fixture: ComponentFixture<CustomerClaimsComponent>;
  let store: MockStore;
  let element: HTMLElement;
  let actions$: Subject<Action>;

  beforeEach(async () => {
    actions$ = new Subject<Action>();
    await TestBed.configureTestingModule({
      imports: [CustomerClaimsComponent],
      providers: [
        provideRouter([]),
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [
            { selector: selectMyClaims, value: [] },
            { selector: selectClaimsLoading, value: false },
            { selector: selectClaimsError, value: null },
            { selector: selectMySubmittedClaimCount, value: 0 },
            { selector: selectMyApprovedClaimCount, value: 0 },
            { selector: selectMyApprovedAmount, value: 0 },
          ],
        }),
        {
          provide: ZoneService,
          useValue: {
            getActiveZones: () => of([{ id: 2, zoneName: 'Hyderabad Gachibowli Zone' }]),
          },
        },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(CustomerClaimsComponent);
    element = fixture.nativeElement;
  });

  function setClaims(claims: ClaimResponse[]): void {
    store.overrideSelector(selectMyClaims, claims);
    store.refreshState();
    fixture.detectChanges();
  }

  it('clears errors and loads my claims on init', () => {
    fixture.detectChanges();

    expect(store.dispatch).toHaveBeenCalledWith(clearClaimsError());
    expect(store.dispatch).toHaveBeenCalledWith(loadMyClaims({}));
  });

  it('reloads the claims when a live claim notification arrives', () => {
    fixture.detectChanges();
    vi.mocked(store.dispatch).mockClear();

    const notify = (relatedEntityType: string) =>
      actions$.next(mergeNewNotifications({
        notifications: [{ id: 1, relatedEntityType, relatedEntityId: 5 } as unknown as NotificationResponse],
      }));
    notify('POLICY');
    expect(store.dispatch).not.toHaveBeenCalled();
    notify('CLAIM');
    expect(store.dispatch).toHaveBeenCalledWith(loadMyClaims({ status: undefined }));
  });

  it('renders a row per claim with formatted labels', () => {
    setClaims([
      makeClaim(),
      makeClaim({ id: 2, claimNumber: 'CLM-0002', status: 'APPROVED', approvedAmount: 18000 }),
    ]);

    const rows = element.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('CLM-0001');
    expect(rows[0].textContent).toContain('Excess Rainfall');
    expect(rows[0].textContent).toContain('Not decided');
    expect(rows[1].textContent).toContain('Approved ₹ 18,000');
  });

  it('dispatches a filtered load when a status filter is clicked', () => {
    fixture.detectChanges();

    const approved = Array.from(element.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Approved',
    ) as HTMLButtonElement;
    approved.click();

    expect(store.dispatch).toHaveBeenCalledWith(loadMyClaims({ status: 'APPROVED' }));
  });
});
