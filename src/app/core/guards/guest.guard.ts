import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectIsAuthenticated } from '../../features/state/auth/auth.selectors';

export const guestGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsAuthenticated).pipe(
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return router.parseUrl('/welcome');
      }
      return true;
    }),
  );
};