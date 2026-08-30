import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  UiBadgeComponent,
  UiButtonDirective,
  UiCardComponent,
  UiDescriptionListComponent,
  UiDescriptionRowComponent,
  UiEmptyStateComponent,
  UiIconComponent,
  UiPageHeaderComponent,
  UiSpinnerComponent,
  UiTableDirective,
  UiTableWrapDirective,
  UiTdDirective,
  UiThDirective,
  UiTrDirective,
} from '@globalart/platform-ui';
import { ApiService } from '../../../core/api.service';
import { RunTaskDialogComponent } from '../run/run-task-dialog.component';
import { TemplateDialogComponent } from '../templates/template-dialog.component';
import type { Task, Template } from '../../../core/models';
import { statusLabel, statusTone, taskDuration } from '../../../core/task-status';

@Component({
  selector: 'aldis-template',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    TranslatePipe,
    UiBadgeComponent,
    UiButtonDirective,
    UiCardComponent,
    UiDescriptionListComponent,
    UiDescriptionRowComponent,
    UiEmptyStateComponent,
    UiIconComponent,
    UiPageHeaderComponent,
    UiSpinnerComponent,
    UiTableDirective,
    UiTableWrapDirective,
    UiTdDirective,
    UiThDirective,
    UiTrDirective,
    RunTaskDialogComponent,
    TemplateDialogComponent,
  ],
  host: { class: 'flex flex-col gap-6' },
  templateUrl: './template.component.html',
})
export class TemplateComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly projectId = Number(this.route.parent?.snapshot.paramMap.get('id'));
  readonly templateId = Number(this.route.snapshot.paramMap.get('templateId'));

  readonly template = signal<Template | null>(null);
  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(true);
  readonly selected = signal<Template | null>(null);
  readonly formOpen = signal(false);

  readonly statusTone = statusTone;
  readonly statusLabel = statusLabel;
  readonly duration = taskDuration;

  constructor() {
    void this.load();
  }

  open(): void {
    this.selected.set(this.template());
  }

  edit(): void {
    this.formOpen.set(true);
  }

  async savedTemplate(): Promise<void> {
    this.formOpen.set(false);
    await this.load();
  }

  async started(task: Task): Promise<void> {
    this.selected.set(null);
    await this.router.navigate(['/project', this.projectId, 'tasks', task.id]);
  }

  async load(): Promise<void> {
    const [template, tasks] = await Promise.all([
      firstValueFrom(this.api.get<Template>(`project/${this.projectId}/templates/${this.templateId}`)),
      firstValueFrom(
        this.api.get<Task[]>(`project/${this.projectId}/templates/${this.templateId}/tasks/last`, { limit: 20 }),
      ),
    ]);

    this.template.set(template ?? null);
    this.tasks.set(tasks ?? []);
    this.loading.set(false);
  }
}
