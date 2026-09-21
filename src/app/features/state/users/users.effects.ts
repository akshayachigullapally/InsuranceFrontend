import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  catchError,
  exhaustMap,
  map,
  switchMap,
} from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { httpErrorMessage } from '../products/products.effects';
import {
  loadUser,
  loadUserFailure,
  loadUserSuccess,
  loadUsers,
  loadUsersFailure,
  loadUsersSuccess,
  updateUserStatus,
  updateUserStatusFailure,
  updateUserStatusSuccess,
} from './users.actions';

@Injectable()
export class UsersEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly userService: UserService,
  ) {}

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUsers),
      switchMap(({ status, segment }) =>
        this.userService.getAllUsers(status, segment).pipe(
          map(users => loadUsersSuccess({ users })),
          catchError(error =>
            of(loadUsersFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUser),
      switchMap(({ userId }) =>
        this.userService.getUser(userId).pipe(
          map(user => loadUserSuccess({ user })),
          catchError(error =>
            of(loadUserFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  updateUserStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUserStatus),
      exhaustMap(({ userId, status }) =>
        this.userService.updateUserStatus(userId, status).pipe(
          map(user => updateUserStatusSuccess({ user })),
          catchError(error =>
            of(updateUserStatusFailure({
              error: httpErrorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );
}