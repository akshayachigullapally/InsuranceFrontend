import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil,
} from 'rxjs/operators';
import {
  CUSTOMER_SEGMENTS,
  CustomerSegment,
  USER_STATUSES,
  UserResponse,
  UserStatus,
} from '../../dtos/auth/user-response.dto';
import {
  clearUsersError,
  clearUsersFilters,
  loadUsers,
  setUsersSearch,
  updateUserStatus,
} from '../../state/users/users.actions';
import {
  selectFilteredUsers,
  selectUpdatingUserId,
  selectUsersError,
  selectUsersLoading,
} from '../../state/users/users.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    ReactiveFormsModule,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  readonly users$: Observable<UserResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly updatingUserId$: Observable<number | null>;
  readonly error$: Observable<string | null>;

  readonly searchControl = new FormControl('', {
    nonNullable: true,
  });

  protected readonly statuses = USER_STATUSES;
  protected readonly segments = CUSTOMER_SEGMENTS;
  protected selectedStatus: UserStatus | null = null;
  protected selectedSegment: CustomerSegment | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store) {
    this.users$ = this.store.select(selectFilteredUsers);
    this.loading$ = this.store.select(selectUsersLoading);
    this.updatingUserId$ = this.store.select(selectUpdatingUserId);
    this.error$ = this.store.select(selectUsersError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearUsersError());
    this.loadUsers();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe(search => {
        this.store.dispatch(setUsersSearch({ search }));
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearUsersError());
  }

  protected onStatusFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    this.selectedStatus = value
      ? value as UserStatus
      : null;

    this.loadUsers();
  }

  protected onSegmentFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    this.selectedSegment = value
      ? value as CustomerSegment
      : null;

    this.loadUsers();
  }

  protected onUserStatusChange(
    user: UserResponse,
    event: Event,
  ): void {
    const select = event.target as HTMLSelectElement;
    const status = select.value as UserStatus;

    if (status === user.profileStatus) {
      return;
    }

    const confirmed = window.confirm(
      `Change ${user.fullName}'s profile status to ${status}?`,
    );

    if (!confirmed) {
      select.value = user.profileStatus ?? '';
      return;
    }

    this.store.dispatch(updateUserStatus({
      userId: user.id,
      status,
    }));
  }

  protected clearFilters(): void {
    this.selectedStatus = null;
    this.selectedSegment = null;
    this.searchControl.setValue('', {
      emitEvent: false,
    });

    this.store.dispatch(clearUsersFilters());
    this.loadUsers();
  }

  protected roleLabel(role: string): string {
    return role
      .replace('ROLE_', '')
      .replaceAll('_', ' ');
  }

  protected segmentLabel(
    segment?: CustomerSegment | null,
  ): string {
    return segment
      ? segment.replaceAll('_', ' ')
      : 'Not completed';
  }

  protected primaryAddress(user: UserResponse): string {
    const addresses = user.addresses ?? [];

    const address =
      addresses.find(item => item.primaryAddress === true) ??
      addresses[0];

    if (!address) {
      return 'No address';
    }

    return [
      address.city,
      address.state,
      address.country,
    ]
      .filter(Boolean)
      .join(', ');
  }

  protected statusValue(user: UserResponse): string {
    return user.profileStatus ?? '';
  }

  protected isUpdating(
    userId: number,
    updatingUserId: number | null,
  ): boolean {
    return userId === updatingUserId;
  }

  private loadUsers(): void {
    this.store.dispatch(loadUsers({
      status: this.selectedStatus ?? undefined,
      segment: this.selectedSegment ?? undefined,
    }));
  }
}