import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockStore } from '@ngrx/store/testing';
import { Observable } from 'rxjs';
import { AuditHistoryComponent } from './audit-history.component';
import { loggedInAuth, mockRootState, pageTestProviders } from '../../../../testing/test-helpers';

type AuditInternals = {
  scope: 'ALL' | 'MINE';
  events$: Observable<{ eventReference: string }[]>;
  entityTypes$: Observable<string[]>;
  total$: Observable<number>;
  searchControl: FormControl<string>;
  entityControl: FormControl<string>;
  roleControl: FormControl<string>;
  userIdControl: FormControl<string>;
  showOnlyMine(): void;
  clearFilters(): void;
  hasFilters(): boolean;
  roleLabel(role: string | null | undefined): string;
  actionTone(eventType: string): string;
};

const auditEvents = [
  { id: 1, eventReference: 'AUD-1', eventType: 'POLICY_APPROVED', entityType: 'POLICY', entityId: 10, actorRole: 'ROLE_UNDERWRITER', actorUserId: 2, description: 'Approved policy' },
  { id: 2, eventReference: 'AUD-2', eventType: 'USER_LOGIN', entityType: 'USER', entityId: 1, actorRole: 'CUSTOMER', actorUserId: 1, description: 'Signed in' },
  { id: 3, eventReference: 'AUD-3', eventType: 'CLAIM_REJECTED', entityType: 'CLAIM', entityId: 5, actorRole: 'ROLE_CLAIMS_OFFICER', actorUserId: 3, description: 'Duplicate' },
];

/**
 * events$ seeds each filter with startWith(control.value) when the component is
 * created, so keep one subscription open and read the latest filtered list.
 */
function watchEvents(page: AuditInternals): () => string[] {
  let latest: string[] = [];
  page.events$.subscribe((events) => (latest = events.map((e) => e.eventReference)));
  return () => latest;
}

async function setup(auditScope: 'ALL' | 'MINE', events: object[] = auditEvents) {
  await TestBed.configureTestingModule({
    providers: pageTestProviders(
      {
        auth: loggedInAuth('ROLE_ADMIN'),
        notifications: { ...mockRootState().notifications, auditEvents: events },
      },
      [{ path: 'audit', component: AuditHistoryComponent, data: { auditScope } }],
    ),
  }).compileComponents();

  const store = TestBed.inject(MockStore);
  vi.spyOn(store, 'dispatch');
  const harness = await RouterTestingHarness.create();
  const component = await harness.navigateByUrl('/audit', AuditHistoryComponent);
  return { page: component as unknown as AuditInternals, store, harness };
}

const thresholdChange = {
  id: 4,
  eventReference: 'AUD-4',
  eventType: 'PRODUCT_THRESHOLD_UPDATED',
  entityType: 'PRODUCT',
  entityId: 1,
  actorRole: 'ROLE_ADMIN',
  actorUserId: 1,
  description: 'Changed trigger threshold of product WEATHER-001 from 150 to 200',
  oldValue: 'Threshold: 150 mm',
  newValue: 'Threshold: 200 mm',
};

describe('AuditHistoryComponent', () => {
  it('shows the before and after values of a change', async () => {
    const { harness } = await setup('ALL', [...auditEvents, thresholdChange]);
    harness.detectChanges();

    const changes = harness.routeNativeElement!.querySelectorAll('[data-testid="audit-change"]');
    expect(changes.length).toBe(1);
    expect(changes[0].textContent).toContain('Threshold: 150 mm');
    expect(changes[0].textContent).toContain('Threshold: 200 mm');
  });

  it('filters by search text, entity type and role', async () => {
    const { page } = await setup('ALL');
    const visible = watchEvents(page);

    page.searchControl.setValue('duplicate');
    expect(visible()).toEqual(['AUD-3']);

    page.clearFilters();
    page.entityControl.setValue('POLICY');
    expect(visible()).toEqual(['AUD-1']);

    page.clearFilters();
    page.roleControl.setValue('CUSTOMER');
    expect(visible()).toEqual(['AUD-2']);
  });

  it('labels roles and colours actions', async () => {
    const { page } = await setup('ALL');

    expect(page.roleLabel('ROLE_ADMIN')).toBe('Administrator');
    expect(page.roleLabel('SYSTEM')).toBe('System');
    expect(page.roleLabel(null)).toBe('Unknown');
    expect(page.actionTone('CLAIM_REJECTED')).toBe('tone-danger');
    expect(page.actionTone('POLICY_APPROVED')).toBe('tone-success');
    expect(page.actionTone('USER_LOGIN')).toBe('tone-info');
    expect(page.actionTone('ZONE_UPDATED')).toBe('tone-neutral');
  });
});
