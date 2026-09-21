import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectIsAuthenticated, selectSessionRestored } from '../../features/state/auth/auth.selectors';
import { restoreSession } from '../../features/state/auth/auth.actions';
import { TokenStorageService } from '../services/token-storage.service';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);
  const tokenStorage = inject(TokenStorageService);

  if (!tokenStorage.hasTokens()) {
    return router.parseUrl('/login');
  }

  return store.select(selectSessionRestored).pipe(
    filter((restored) => restored),
    take(1),
    switchMap(() => store.select(selectIsAuthenticated).pipe(take(1))),
    map((isAuthenticated) => {
      if (!isAuthenticated) {
        return router.parseUrl('/login');
      }
      return true;
    }),
  );
};