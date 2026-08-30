export type TaskStatus =
  | 'waiting'
  | 'starting'
  | 'waiting_confirmation'
  | 'confirmed'
  | 'rejected'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'success'
  | 'error';

export type TemplateApp = 'ansible' | 'terraform' | 'tofu' | 'terragrunt' | 'bash' | 'python' | 'pulumi' | string;

export interface Project {
  id: number;
  name: string;
  created: string;
  type: string;
  alert?: boolean;
  max_parallel_tasks?: number;
}

export interface Task {
  id: number;
  template_id: number;
  project_id: number;
  status: TaskStatus;
  debug: boolean;
  dry_run: boolean;
  diff: boolean;
  playbook: string;
  environment?: string;
  message?: string;
  created: string;
  start?: string;
  end?: string;
  commit_hash?: string;
  commit_message?: string;
  tpl_playbook?: string;
  tpl_alias?: string;
  tpl_app?: TemplateApp;
  user_name?: string;
  used_runner_name?: string;
}

export interface TaskOutput {
  id: number;
  task_id: number;
  time: string;
  output: string;
}

export interface Template {
  id: number;
  project_id: number;
  inventory_id?: number;
  repository_id: number;
  environment_ids: number[];
  name: string;
  playbook: string;
  description?: string;
  type?: string;
  app?: TemplateApp;
  arguments?: string;
  git_branch?: string;
  view_id?: number;
  autorun?: boolean;
  tasks: number;
  last_task?: Task;
}

export interface Inventory {
  id: number;
  name: string;
  project_id: number;
  inventory: string;
  type: string;
  ssh_key_id?: number;
  become_key_id?: number;
  repository_id?: number;
}

export interface AccessKey {
  id: number;
  name: string;
  type: string;
  project_id?: number;
  owner?: string;
}

export interface Repository {
  id: number;
  name: string;
  project_id: number;
  git_url: string;
  git_branch: string;
  ssh_key_id: number;
}

export interface Environment {
  id: number;
  name: string;
  project_id: number;
  json: string;
  env?: string;
}

export interface Schedule {
  id: number;
  project_id: number;
  template_id: number;
  cron_format: string;
  name: string;
  active: boolean;
  tpl_name: string;
  repository_id?: number;
}

export interface Integration {
  id: number;
  name: string;
  project_id: number;
  template_id: number;
  auth_method: string;
  searchable: boolean;
}

export interface View {
  id: number;
  project_id: number;
  title: string;
  position: number;
}

export interface ProjectMember {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
}

export interface TaskStat {
  date: string;
  count_by_status: Record<string, number>;
}
