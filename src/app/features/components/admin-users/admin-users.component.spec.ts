import { DialogService } from '../../../shared/services/dialog.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { AdminUsersComponent } from './admin-users.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import {
  clearUsersError,
  clearUsersFilters,
  loadUsers,
  setUsersSearch,
  updateUserStatus,
} from '../../state/users/users.actions';
import { UserResponse } from '../../dtos/auth/user-response.dto';

type UsersInternals = {
  onStatusFilter(event: Event): void;
  onSegmentFilter(event: Event): void;
  onUserStatusChange(user: UserResponse, event: Event): void;
  clearFilters(): void;
  roleLabel(role: string): string;
  segmentLabel(segment?: string | null): string;
  primaryAddress(user: UserResponse): string;
};

function selectEvent(value: string): Event {
  const select = document.createElement('select');
  const option = document.createElement('option');
  option.value = value;
  select.appendChild(option);
  select.value = value;
  return { target: select } as unknown as Event;
}

describe('AdminUsersComponent', () => {
  let fixture: ComponentFixture<AdminUsersComponent>;
  let component: AdminUsersComponent;
  let page: UsersInternals;
  let store: MockStore;
  const user = { id: 4, fullName: 'Ravi Kumar', email: 'ravi@example.com', role: 'ROLE_CUSTOMER', profileStatus: 'ACTIVE' } as UserResponse;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUsersComponent],
      providers: pageTestProviders(),
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(AdminUsersComponent);
    component = fixture.componentInstance;
    page = component as unknown as UsersInternals;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('clears errors and loads users on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(clearUsersError());
    expect(store.dispatch).toHaveBeenCalledWith(loadUsers({ status: undefined, segment: undefined }));
  });

  it('reloads users with status and segment filters', () => {
    page.onStatusFilter(selectEvent('SUSPENDED'));
    page.onSegmentFilter(selectEvent('FARMER'));

    expect(store.dispatch).toHaveBeenCalledWith(loadUsers({ status: 'SUSPENDED', segment: 'FARMER' }));
  });

  it('debounces the search box', () => {
    vi.useFakeTimers();

    component.searchControl.setValue('ravi');
    vi.advanceTimersByTime(250);

    expect(store.dispatch).toHaveBeenCalledWith(setUsersSearch({ search: 'ravi' }));
  });

  it('changes a user status only after confirmation', async () => {
    const confirm = vi.spyOn(TestBed.inject(DialogService), 'confirm').mockResolvedValue(false);
    const cancelled = selectEvent('SUSPENDED');
    await page.onUserStatusChange(user, cancelled);
    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: updateUserStatus.type }));

    confirm.mockResolvedValue(true);
    await page.onUserStatusChange(user, selectEvent('SUSPENDED'));
    expect(store.dispatch).toHaveBeenCalledWith(updateUserStatus({ userId: 4, status: 'SUSPENDED' }));
  });

  it('ignores selecting the current status', async () => {
    const confirm = vi.spyOn(TestBed.inject(DialogService), 'confirm');

    await page.onUserStatusChange(user, selectEvent('ACTIVE'));

    expect(confirm).not.toHaveBeenCalled();
  });

  it('clears all filters and reloads', () => {
    page.onStatusFilter(selectEvent('SUSPENDED'));
    vi.mocked(store.dispatch).mockClear();

    page.clearFilters();

    expect(store.dispatch).toHaveBeenCalledWith(clearUsersFilters());
    expect(store.dispatch).toHaveBeenCalledWith(loadUsers({ status: undefined, segment: undefined }));
  });

  it('formats labels and addresses', () => {
    expect(page.roleLabel('ROLE_CLAIMS_OFFICER')).toBe('CLAIMS OFFICER');
    expect(page.segmentLabel('SMALL_BUSINESS')).toBe('SMALL BUSINESS');
    expect(page.segmentLabel(null)).toBe('Not completed');
    expect(page.primaryAddress(user)).toBe('No address');
    expect(
      page.primaryAddress({ ...user, addresses: [{ city: 'Pune', state: 'Maharashtra', country: 'India' }] } as UserResponse),
    ).toBe('Pune, Maharashtra, India');
  });
});
