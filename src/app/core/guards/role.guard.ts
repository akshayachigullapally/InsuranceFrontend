import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectAuthRole, selectSessionRestored } from '../../features/state/auth/auth.selectors';
import { normalizeRole } from '../constants/roles';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  const router = inject(Router);
  const allowedRoles: string[] = route.data?.['roles'] ?? [];

  return store.select(selectSessionRestored).pipe(
    filter((restored) => restored),
    take(1),
    switchMap(() => store.select(selectAuthRole).pipe(take(1))),
    map((role) => {
      const normalized = normalizeRole(role);
      if (!normalized) {
        return router.parseUrl('/login');
      }
      if (allowedRoles.length > 0 && !allowedRoles.includes(normalized)) {
        return router.parseUrl('/welcome');
      }
      return true;
    }),
  );
};