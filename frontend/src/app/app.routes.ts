import { Routes } from '@angular/router';
import { signedInGuard } from './core/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { ShellComponent } from './layout/shell.component';
import { ProjectShellComponent } from './layout/project-shell.component';
import type { ResourceConfig } from './pages/project/resources/resource.model';

const RESOURCES: Record<string, ResourceConfig> = {
  inventory: {
    titleKey: 'inventory',
    path: 'inventory',
    icon: 'globe',
    emptyKey: 'none',
    columns: [
      { title: 'ID', field: 'id', kind: 'mono', width: '80px' },
      { title: 'Name', field: 'name' },
      { title: 'Type', field: 'type', kind: 'badge' },
    ],
  },
  environment: {
    titleKey: 'environment',
    path: 'environment',
    icon: 'variable',
    emptyKey: 'none',
    columns: [
      { title: 'ID', field: 'id', kind: 'mono', width: '80px' },
      { title: 'Name', field: 'name' },
    ],
  },
  keys: {
    titleKey: 'keyStore',
    path: 'keys',
    icon: 'key-round',
    emptyKey: 'none',
    columns: [
      { title: 'ID', field: 'id', kind: 'mono', width: '80px' },
      { title: 'Name', field: 'name' },
      { title: 'Type', field: 'type', kind: 'badge' },
    ],
  },
  repositories: {
    titleKey: 'repositories',
    path: 'repositories',
    icon: 'copy',
    emptyKey: 'none',
    columns: [
      { title: 'ID', field: 'id', kind: 'mono', width: '80px' },
      { title: 'Name', field: 'name' },
      { title: 'Git URL', field: 'git_url', kind: 'mono' },
      { title: 'Branch', field: 'git_branch', kind: 'badge' },
    ],
  },
  schedules: {
    titleKey: 'schedule',
    path: 'schedules',
    icon: 'refresh-cw',
    emptyKey: 'none',
    columns: [
      { title: 'ID', field: 'id', kind: 'mono', width: '80px' },
      { title: 'Name', field: 'name' },
      { title: 'Template', field: 'tpl_name' },
      { title: 'Cron', field: 'cron_format', kind: 'mono' },
      { title: 'Active', field: 'active', kind: 'bool' },
    ],
  },
  integrations: {
    titleKey: 'integrations',
    path: 'integrations',
    icon: 'radio',
    emptyKey: 'none',
    columns: [
      { title: 'ID', field: 'id', kind: 'mono', width: '80px' },
      { title: 'Name', field: 'name' },
      { title: 'Auth', field: 'auth_method', kind: 'badge' },
    ],
  },
  team: {
    titleKey: 'team',
    path: 'users',
    icon: 'users',
    emptyKey: 'none',
    columns: [
      { title: 'ID', field: 'id', kind: 'mono', width: '80px' },
      { title: 'Name', field: 'name' },
      { title: 'Username', field: 'username', kind: 'mono' },
      { title: 'Role', field: 'role', kind: 'badge' },
    ],
  },
  runners: {
    titleKey: 'runners',
    path: 'runners',
    icon: 'shield',
    emptyKey: 'none',
    columns: [
      { title: 'ID', field: 'id', kind: 'mono', width: '80px' },
      { title: 'Name', field: 'name' },
      { title: 'Tags', field: 'tags' },
      { title: 'Status', field: 'status', kind: 'badge' },
      { title: 'Active', field: 'active', kind: 'bool' },
    ],
  },
};

const resourceRoute = (path: string) => ({
  path,
  data: { resource: RESOURCES[path] },
  loadComponent: () =>
    import('./pages/project/resources/resource-list.component').then((m) => m.ResourceListComponent),
});

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
  {
    path: 'project/:id',
    component: ProjectShellComponent,
    canActivate: [signedInGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/project/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'templates',
        loadComponent: () =>
          import('./pages/project/templates/templates.component').then((m) => m.TemplatesComponent),
      },
      {
        path: 'templates/:templateId',
        loadComponent: () =>
          import('./pages/project/template/template.component').then((m) => m.TemplateComponent),
      },
      {
        path: 'tasks',
        loadComponent: () => import('./pages/project/tasks/tasks.component').then((m) => m.TasksComponent),
      },
      {
        path: 'tasks/:taskId',
        loadComponent: () => import('./pages/project/task/task.component').then((m) => m.TaskComponent),
      },
      resourceRoute('inventory'),
      resourceRoute('environment'),
      resourceRoute('keys'),
      resourceRoute('repositories'),
      resourceRoute('schedules'),
      resourceRoute('integrations'),
      resourceRoute('team'),
      resourceRoute('runners'),
    ],
  },
  { path: '**', redirectTo: '' },
];
