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
  ],
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

  readonly statusTone = statusTone;
  readonly statusLabel = statusLabel;
  readonly duration = taskDuration;

  constructor() {
    void this.load();
  }

  open(): void {
    this.selected.set(this.template());
  }

  async started(task: Task): Promise<void> {
    this.selected.set(null);
    await this.router.navigate(['/project', this.projectId, 'tasks', task.id]);
  }

  private async load(): Promise<void> {
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
