import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { UserState } from '../features/auth/services/user.state';

// ✅ AdminGuard
export const AdminGuard: CanActivateFn = () => {
  const userState = inject(UserState);
  const router = inject(Router);

  return userState.currentUser$.pipe(
    map(user => {
      if (user?.roles.includes('Admin')) {
        return true;
      } else {
        return router.parseUrl('/');
      }
    })
  );
};

// ✅ AuthGuard
  export const AuthGuard: CanActivateFn = () => {
    const userState = inject(UserState);
    const router = inject(Router);

    return userState.currentUser$.pipe(
      map(user => {
        if (user == null) {
          return true;
        } else {
          return router.parseUrl('/');
        }
      })
    );
  };
