import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../features/auth/auth.service';

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  console.log('canActivateFn guard running');

  const expectedRoles = route.data['roles'] as string[];
  const userRole = auth.getRole();

  if (auth.isAuthenticated() && expectedRoles.includes(userRole!)) {
    return true;
  }

  return router.parseUrl('/auth');
};
