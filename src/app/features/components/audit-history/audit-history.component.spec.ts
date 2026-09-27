import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockStore } from '@ngrx/store/testing';
import { Observable, firstValueFrom } from 'rxjs';
import { AuditHistoryComponent } from './audit-history.component';
import { loggedInAuth, mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import {
  clearNotificationsError,
  loadAuditEvents,
  loadMyAuditEvents,
} from '../../state/notifications/notifications.actions';

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
  { eventReference: 'AUD-1', eventType: 'POLICY_APPROVED', entityType: 'POLICY', entityId: 10, actorRole: 'ROLE_UNDERWRITER', actorUserId: 2, description: 'Approved policy' },
  { eventReference: 'AUD-2', eventType: 'USER_LOGIN', entityType: 'USER', entityId: 1, actorRole: 'CUSTOMER', actorUserId: 1, description: 'Signed in' },
  { eventReference: 'AUD-3', eventType: 'CLAIM_REJECTED', entityType: 'CLAIM', entityId: 5, actorRole: 'ROLE_CLAIMS_OFFICER', actorUserId: 3, description: 'Duplicate' },
];

async function setup(auditScope: 'ALL' | 'MINE') {
  await TestBed.configureTestingModule({
    providers: pageTestProviders(
      {
        auth: loggedInAuth('ROLE_ADMIN'),
        notifications: { ...mockRootState().notifications, auditEvents },
      },
      [{ path: 'audit', component: AuditHistoryComponent, data: { auditScope } }],
    ),
  }).compileComponents();

  const store = TestBed.inject(MockStore);
  vi.spyOn(store, 'dispatch');
  const harness = await RouterTestingHarness.create();
  const component = await harness.navigateByUrl('/audit', AuditHistoryComponent);
  return { page: component as unknown as AuditInternals, store };
}

describe('AuditHistoryComponent', () => {
  it('loads every audit event for the ALL scope', async () => {
    const { page, store } = await setup('ALL');

    expect(page.scope).toBe('ALL');
    expect(store.dispatch).toHaveBeenCalledWith(clearNotificationsError());
    expect(store.dispatch).toHaveBeenCalledWith(loadAuditEvents());
  });

  it('loads only my audit events for the MINE scope', async () => {
    const { page, store } = await setup('MINE');

    expect(page.scope).toBe('MINE');
    expect(store.dispatch).toHaveBeenCalledWith(loadMyAuditEvents());
  });

  it('lists distinct sorted entity types and the total', async () => {
    const { page } = await setup('ALL');

    expect(await firstValueFrom(page.entityTypes$)).toEqual(['CLAIM', 'POLICY', 'USER']);
    expect(await firstValueFrom(page.total$)).toBe(3);
  });

  it('filters by search text, entity type and role', async () => {
    const { page } = await setup('ALL');

    page.searchControl.setValue('duplicate');
    expect((await firstValueFrom(page.events$)).map((e) => e.eventReference)).toEqual(['AUD-3']);

    page.clearFilters();
    page.entityControl.setValue('POLICY');
    expect((await firstValueFrom(page.events$)).map((e) => e.eventReference)).toEqual(['AUD-1']);

    page.clearFilters();
    page.roleControl.setValue('CUSTOMER');
    expect((await firstValueFrom(page.events$)).map((e) => e.eventReference)).toEqual(['AUD-2']);
  });

  it('filters to my own actions', async () => {
    const { page } = await setup('ALL');

    page.showOnlyMine();

    expect(page.userIdControl.value).toBe('1');
    expect(page.hasFilters()).toBe(true);
    expect((await firstValueFrom(page.events$)).map((e) => e.eventReference)).toEqual(['AUD-2']);
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
