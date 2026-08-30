import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  UiBadgeComponent,
  UiButtonDirective,
  UiCardComponent,
  UiEmptyStateComponent,
  UiIconComponent,
  UiPageHeaderComponent,
  UiSpinnerComponent,
  UiStatComponent,
  UiTableDirective,
  UiTableWrapDirective,
  UiTdDirective,
  UiThDirective,
  UiTrDirective,
} from '@globalart/platform-ui';
import { ApiService } from '../../../core/api.service';
import type { Task, Template } from '../../../core/models';
import { ProjectService } from '../../../core/project.service';
import { statusLabel, statusTone, taskDuration } from '../../../core/task-status';

@Component({
  selector: 'aldis-project-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    TranslatePipe,
    UiBadgeComponent,
    UiButtonDirective,
    UiCardComponent,
    UiEmptyStateComponent,
    UiIconComponent,
    UiPageHeaderComponent,
    UiSpinnerComponent,
    UiStatComponent,
    UiTableDirective,
    UiTableWrapDirective,
    UiTdDirective,
    UiThDirective,
    UiTrDirective,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly projects = inject(ProjectService);

  readonly project = this.projects.current;
  readonly templates = signal<Template[]>([]);
  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(true);
  readonly running = signal<number | null>(null);

  readonly succeeded = computed(() => this.tasks().filter((task) => task.status === 'success').length);
  readonly failed = computed(() =>
    this.tasks().filter((task) => task.status === 'error' || task.status === 'rejected').length,
  );
  readonly recent = computed(() => this.tasks().slice(0, 10));

  readonly statusTone = statusTone;
  readonly statusLabel = statusLabel;
  readonly duration = taskDuration;

  constructor() {
    void this.load();
  }

  async run(template: Template): Promise<void> {
    this.running.set(template.id);
    try {
      const task = await firstValueFrom(
        this.api.post<Task>(`project/${template.project_id}/tasks`, { template_id: template.id }),
      );
      await this.router.navigate(['/project', template.project_id, 'tasks', task.id]);
    } finally {
      this.running.set(null);
    }
  }

  private async load(): Promise<void> {
    const id = this.project()?.id ?? Number(this.router.url.split('/')[2]);
    this.loading.set(true);

    const [templates, tasks] = await Promise.all([
      firstValueFrom(this.api.get<Template[]>(`project/${id}/templates`)),
      firstValueFrom(this.api.get<Task[]>(`project/${id}/tasks/last`, { limit: 50 })),
    ]);

    this.templates.set(templates ?? []);
    this.tasks.set(tasks ?? []);
    this.loading.set(false);
  }
}
