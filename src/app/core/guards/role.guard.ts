import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectAuthRole } from '../../features/state/auth/auth.selectors';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  const router = inject(Router);
  const allowedRoles: string[] = route.data?.['roles'] ?? [];

  return store.select(selectAuthRole).pipe(
    take(1),
    map((role) => {
      if (!role) {
        return router.parseUrl('/login');
      }
      if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        return router.parseUrl('/welcome');
      }
      return true;
    }),
  );
};