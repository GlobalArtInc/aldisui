import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ProjectService } from './project.service';

export const signedInGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.signedIn()) {
    return true;
  }

  const user = await auth.refresh();
  return user !== null ? true : router.createUrlTree(['/login']);
};

export const activeProjectGuard: CanActivateFn = async () => {
  const projects = inject(ProjectService);
  const router = inject(Router);

  const project = await projects.active();
  return project ? router.createUrlTree(['/project', project.id]) : router.createUrlTree(['/projects']);
};
