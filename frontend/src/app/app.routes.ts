import { Routes } from '@angular/router';
import { signedInGuard } from './core/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [signedInGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/projects/projects.component').then((m) => m.ProjectsComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
