import { Routes } from '@angular/router';
import { activeProjectGuard, signedInGuard, taskDialogRedirect } from './core/auth.guard';
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
    createKey: 'newInventory',
    deleteKey: 'deleteInventory',
    askKey: 'askDeleteInv',
    columns: [
      { title: 'id', field: 'id', kind: 'mono', width: '80px' },
      { title: 'name', field: 'name', width: '30%' },
      { title: 'type', field: 'type', kind: 'badge', width: '160px' },
    ],
    fields: [
      { name: 'name', label: 'name', required: true },
      {
        name: 'type',
        label: 'type',
        type: 'select',
        required: true,
        value: 'static',
        options: [
          { label: 'static', value: 'static' },
          { label: 'static-yaml', value: 'static-yaml' },
          { label: 'file', value: 'file' },
        ],
      },
      { name: 'inventory', label: 'inventoryContent', type: 'textarea', when: { field: 'type', is: ['static', 'static-yaml'] } },
      { name: 'inventory', label: 'pathToInventoryFile', when: { field: 'type', is: ['file'] } },
      { name: 'ssh_key_id', label: 'sshKey', type: 'select', source: 'keys' },
      { name: 'become_key_id', label: 'becomeKey', type: 'select', source: 'keys' },
    ],
  },
  environment: {
    titleKey: 'environment',
    path: 'environment',
    icon: 'variable',
    emptyKey: 'none',
    createKey: 'newEnvironment',
    deleteKey: 'deleteEnvironment',
    askKey: 'askDeleteEnv',
    columns: [
      { title: 'id', field: 'id', kind: 'mono', width: '80px' },
      { title: 'name', field: 'name', width: '30%' },
    ],
    fields: [
      { name: 'name', label: 'environmentName', required: true },
      { name: 'json', label: 'extraVariables', type: 'textarea', value: '{}' },
      { name: 'env', label: 'environmentVariables', type: 'textarea', value: '{}' },
    ],
  },
  keys: {
    titleKey: 'keyStore',
    path: 'keys',
    icon: 'key-round',
    emptyKey: 'none',
    createKey: 'newKey',
    deleteKey: 'deleteKey',
    askKey: 'askDeleteKey',
    columns: [
      { title: 'id', field: 'id', kind: 'mono', width: '80px' },
      { title: 'name', field: 'name', width: '30%' },
      { title: 'type', field: 'type', kind: 'badge', width: '160px' },
    ],
    fields: [
      { name: 'name', label: 'name', required: true },
      {
        name: 'type',
        label: 'type',
        type: 'select',
        required: true,
        value: 'ssh',
        options: [
          { label: 'SSH', value: 'ssh' },
          { label: 'Login with password', value: 'login_password' },
          { label: 'None', value: 'none' },
        ],
      },
      { name: 'ssh.login', label: 'loginOptional', when: { field: 'type', is: ['ssh'] } },
      { name: 'ssh.passphrase', label: 'passphrase', type: 'password', when: { field: 'type', is: ['ssh'] } },
      { name: 'ssh.private_key', label: 'privateKey', type: 'textarea', when: { field: 'type', is: ['ssh'] } },
      { name: 'login_password.login', label: 'username', when: { field: 'type', is: ['login_password'] } },
      { name: 'login_password.password', label: 'password', type: 'password', when: { field: 'type', is: ['login_password'] } },
    ],
  },
  repositories: {
    titleKey: 'repositories',
    path: 'repositories',
    icon: 'copy',
    emptyKey: 'none',
    createKey: 'newRepository',
    deleteKey: 'deleteRepository',
    askKey: 'askDeleteRepo',
    columns: [
      { title: 'id', field: 'id', kind: 'mono', width: '80px' },
      { title: 'name', field: 'name', width: '30%' },
      { title: 'gitUrl', field: 'git_url', kind: 'mono', width: '38%' },
      { title: 'branch', field: 'git_branch', kind: 'badge', width: '160px' },
    ],
    fields: [
      { name: 'name', label: 'name', required: true },
      { name: 'git_url', label: 'gitUrl', required: true },
      { name: 'git_branch', label: 'branch', required: true, value: 'main' },
      { name: 'ssh_key_id', label: 'sshKey', type: 'select', source: 'keys', required: true },
    ],
  },
  schedules: {
    titleKey: 'schedule',
    path: 'schedules',
    icon: 'refresh-cw',
    emptyKey: 'none',
    createKey: 'newSchedule',
    deleteKey: 'deleteSchedule',
    askKey: 'askDeleteSchedule',
    columns: [
      { title: 'id', field: 'id', kind: 'mono', width: '80px' },
      { title: 'name', field: 'name', width: '30%' },
      { title: 'template', field: 'tpl_name', width: '28%' },
      { title: 'cron', field: 'cron_format', kind: 'mono', width: '180px' },
      { title: 'active', field: 'active', kind: 'bool', width: '120px' },
    ],
    accent: { field: 'active', map: { true: 'ok' }, fallback: 'none' },
    fields: [
      { name: 'name', label: 'name' },
      { name: 'template_id', label: 'template', type: 'select', source: 'templates', required: true },
      { name: 'cron_format', label: 'cron', required: true, value: '0 3 * * *' },
      { name: 'active', label: 'active', type: 'switch', value: true },
    ],
  },
  integrations: {
    titleKey: 'integrations',
    path: 'integrations',
    icon: 'radio',
    emptyKey: 'none',
    createKey: 'newIntegration',
    deleteKey: 'deleteIntegration',
    askKey: 'askDeleteIntegration',
    columns: [
      { title: 'id', field: 'id', kind: 'mono', width: '80px' },
      { title: 'name', field: 'name', width: '30%' },
      { title: 'type', field: 'auth_method', kind: 'badge', width: '180px' },
    ],
    fields: [
      { name: 'name', label: 'name', required: true },
      { name: 'template_id', label: 'template', type: 'select', source: 'templates', required: true },
      {
        name: 'auth_method',
        label: 'type',
        type: 'select',
        value: '',
        options: [
          { label: 'None', value: '' },
          { label: 'GitHub', value: 'github' },
          { label: 'Bitbucket', value: 'bitbucket' },
          { label: 'Token', value: 'token' },
          { label: 'HMAC', value: 'hmac' },
          { label: 'Basic', value: 'basic' },
        ],
      },
      { name: 'auth_header', label: 'name', when: { field: 'auth_method', is: ['token', 'hmac'] } },
      { name: 'searchable', label: 'active', type: 'switch' },
    ],
  },
  team: {
    titleKey: 'team',
    path: 'users',
    icon: 'users',
    emptyKey: 'none',
    createKey: 'newTeamMember',
    deleteKey: 'deleteTeamMember',
    askKey: 'askDeleteTMem',
    columns: [
      { title: 'id', field: 'id', kind: 'mono', width: '80px' },
      { title: 'name', field: 'name', width: '30%' },
      { title: 'username', field: 'username', kind: 'mono', width: '220px' },
      { title: 'role', field: 'role', kind: 'badge', width: '160px' },
    ],
    fields: [
      { name: 'user_id', label: 'user', type: 'select', source: 'users', required: true },
      {
        name: 'role',
        label: 'role',
        type: 'select',
        required: true,
        value: 'task_runner',
        options: [
          { label: 'Owner', value: 'owner' },
          { label: 'Manager', value: 'manager' },
          { label: 'Task runner', value: 'task_runner' },
          { label: 'Guest', value: 'guest' },
        ],
      },
    ],
  },
  runners: {
    titleKey: 'runners',
    path: 'runners',
    icon: 'shield',
    emptyKey: 'none',
    columns: [
      { title: 'id', field: 'id', kind: 'mono', width: '80px' },
      { title: 'name', field: 'name', width: '30%' },
      { title: 'tags', field: 'tags', width: '220px' },
      { title: 'status', field: 'status', kind: 'badge', width: '160px' },
      { title: 'active', field: 'active', kind: 'bool', width: '120px' },
    ],
    accent: { field: 'status', map: { online: 'ok', offline: 'danger' }, fallback: 'none' },
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
    pathMatch: 'full',
    canActivate: [signedInGuard, activeProjectGuard],
    children: [],
  },
  {
    path: 'projects',
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
        canActivate: [taskDialogRedirect],
        children: [],
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
