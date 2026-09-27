import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { UsersEffects } from './users.effects';
import * as UsersActions from './users.actions';
import { UserService } from '../../services/user.service';
import { UserResponse } from '../../dtos/auth/user-response.dto';

function collect(effect$: Observable<unknown>): unknown[] {
  const results: unknown[] = [];
  effect$.subscribe((action) => results.push(action));
  return results;
}

describe('UsersEffects', () => {
  let actions$: Observable<Action>;
  let effects: UsersEffects;
  let userService: Record<string, ReturnType<typeof vi.fn>>;
  const user = { id: 1, fullName: 'Asha', email: 'a@example.com', role: 'ROLE_CUSTOMER' } as UserResponse;

  beforeEach(() => {
    userService = { getAllUsers: vi.fn(), getUser: vi.fn(), updateUserStatus: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        UsersEffects,
        provideMockActions(() => actions$),
        { provide: UserService, useValue: userService },
      ],
    });
    effects = TestBed.inject(UsersEffects);
  });

  it('loads users with the filters', () => {
    userService['getAllUsers'].mockReturnValue(of([user]));
    actions$ = of(UsersActions.loadUsers({ status: 'ACTIVE', segment: 'FARMER' }));

    expect(collect(effects.loadUsers$)).toEqual([UsersActions.loadUsersSuccess({ users: [user] })]);
    expect(userService['getAllUsers']).toHaveBeenCalledWith('ACTIVE', 'FARMER');
  });

  it('loads a single user', () => {
    userService['getUser'].mockReturnValue(of(user));
    actions$ = of(UsersActions.loadUser({ userId: 1 }));

    expect(collect(effects.loadUser$)).toEqual([UsersActions.loadUserSuccess({ user })]);
  });

  it('maps status update errors', () => {
    userService['updateUserStatus'].mockReturnValue(throwError(() => ({ error: { message: 'Not allowed' } })));
    actions$ = of(UsersActions.updateUserStatus({ userId: 1, status: 'SUSPENDED' }));

    expect(collect(effects.updateUserStatus$)).toEqual([
      UsersActions.updateUserStatusFailure({ error: 'Not allowed' }),
    ]);
  });
});
