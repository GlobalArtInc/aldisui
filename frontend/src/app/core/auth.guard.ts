import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const signedInGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.signedIn()) {
    return true;
  }

  const user = await auth.refresh();
  return user !== null ? true : router.createUrlTree(['/login']);
};
