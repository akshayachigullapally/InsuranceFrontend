import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith, take } from 'rxjs/operators';
import { ROLE_LABELS } from '../../../core/constants/roles';
import { AuditEventResponse } from '../../dtos/notifications/notification-response.dto';
import { selectAuthUser } from '../../state/auth/auth.selectors';
import {
  clearNotificationsError,
  loadAuditEvents,
  loadMyAuditEvents,
} from '../../state/notifications/notifications.actions';
import {
  selectAuditEvents,
  selectNotificationsError,
  selectNotificationsLoading,
} from '../../state/notifications/notifications.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/** MINE: the signed-in user's own history. ALL: every user's history (admin only). */
type AuditScope = 'MINE' | 'ALL';

const ROLE_FILTERS = ['CUSTOMER', 'UNDERWRITER', 'CLAIMS_OFFICER', 'ADMIN', 'SYSTEM'] as const;

@Component({
  selector: 'app-audit-history',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    ReactiveFormsModule,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './audit-history.component.html',
  styleUrl: './audit-history.component.css',
})
export class AuditHistoryComponent implements OnInit {
  protected readonly scope: AuditScope;
  protected readonly roleFilters = ROLE_FILTERS;

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly entityControl = new FormControl('', { nonNullable: true });
  protected readonly roleControl = new FormControl('', { nonNullable: true });
  protected readonly userIdControl = new FormControl('', { nonNullable: true });

  protected readonly loading$: Observable<boolean>;
  protected readonly error$: Observable<string | null>;
  protected readonly entityTypes$: Observable<string[]>;
  protected readonly events$: Observable<AuditEventResponse[]>;
  protected readonly total$: Observable<number>;

  constructor(
    private readonly store: Store,
    route: ActivatedRoute,
  ) {
    this.scope = route.snapshot.data['auditScope'] === 'ALL' ? 'ALL' : 'MINE';

    const all$ = this.store.select(selectAuditEvents);
    this.loading$ = this.store.select(selectNotificationsLoading);
    this.error$ = this.store.select(selectNotificationsError);
    this.total$ = all$.pipe(map((events) => events.length));

    this.entityTypes$ = all$.pipe(
      map((events) => [...new Set(events.map((e) => e.entityType).filter(Boolean))].sort()),
    );

    const value$ = (control: FormControl<string>) =>
      control.valueChanges.pipe(startWith(control.value));

    this.events$ = combineLatest([
      all$,
      value$(this.searchControl),
      value$(this.entityControl),
      value$(this.roleControl),
      value$(this.userIdControl),
    ]).pipe(
      map(([events, search, entity, role, userId]) => {
        const term = search.trim().toLowerCase();
        const actorId = userId.trim();

        return events.filter(
          (e) =>
            (!entity || e.entityType === entity) &&
            (!role || AuditHistoryComponent.roleKey(e.actorRole) === role) &&
            (!actorId || String(e.actorUserId ?? '') === actorId) &&
            (!term ||
              [
                e.eventType,
                e.description,
                e.eventReference,
                e.entityType,
                String(e.entityId ?? ''),
              ].some((v) => (v ?? '').toLowerCase().includes(term))),
        );
      }),
    );
  }

  ngOnInit(): void {
    this.refresh();
  }

  protected refresh(): void {
    this.store.dispatch(clearNotificationsError());
    this.store.dispatch(this.scope === 'ALL' ? loadAuditEvents() : loadMyAuditEvents());
  }

  protected showOnlyMine(): void {
    this.store
      .select(selectAuthUser)
      .pipe(take(1))
      .subscribe((user) => this.userIdControl.setValue(user ? String(user.id) : ''));
  }

  protected clearFilters(): void {
    this.searchControl.setValue('');
    this.entityControl.setValue('');
    this.roleControl.setValue('');
    this.userIdControl.setValue('');
  }

  protected hasFilters(): boolean {
    return !!(
      this.searchControl.value ||
      this.entityControl.value ||
      this.roleControl.value ||
      this.userIdControl.value
    );
  }

  protected humanize(value: string | null | undefined): string {
    if (!value) return '—';
    const text = value.replaceAll('_', ' ').toLowerCase();
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  protected roleLabel(role: string | null | undefined): string {
    const key = AuditHistoryComponent.roleKey(role);
    if (!key) return 'Unknown';
    if (key === 'SYSTEM') return 'System';
    return ROLE_LABELS[`ROLE_${key}`] ?? this.humanize(key);
  }

  protected actionTone(eventType: string): string {
    if (/REJECT|FAIL|CANCEL|ARCHIV|DEACTIVAT/.test(eventType)) return 'tone-danger';
    if (/APPROV|VERIF|SUCCESS|SETTLED|COMPLETED|ACCEPTED/.test(eventType)) return 'tone-success';
    if (/LOGIN|LOGOUT|PASSWORD|REGISTER/.test(eventType)) return 'tone-info';
    return 'tone-neutral';
  }

  private static roleKey(role: string | null | undefined): string {
    if (!role) return '';
    const upper = role.toUpperCase();
    return upper.startsWith('ROLE_') ? upper.slice(5) : upper;
  }
}
