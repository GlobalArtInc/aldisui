import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  UiBadgeComponent,
  UiButtonDirective,
  UiCardComponent,
  UiDescriptionListComponent,
  UiDescriptionRowComponent,
  UiIconComponent,
  UiPageHeaderComponent,
  UiSpinnerComponent,
} from '@globalart/platform-ui';
import { ansiToHtml } from '../../../core/ansi';
import { ApiService } from '../../../core/api.service';
import type { Task, TaskOutput } from '../../../core/models';
import { isTaskActive, statusLabel, statusTone, taskDuration } from '../../../core/task-status';

interface LogLine {
  id: number;
  time: string;
  html: string;
}

@Component({
  selector: 'aldis-task',
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
    UiIconComponent,
    UiPageHeaderComponent,
    UiSpinnerComponent,
  ],
  templateUrl: './task.component.html',
})
export class TaskComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  readonly projectId = Number(this.route.parent?.snapshot.paramMap.get('id'));
  readonly taskId = Number(this.route.snapshot.paramMap.get('taskId'));

  readonly task = signal<Task | null>(null);
  readonly lines = signal<LogLine[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);

  readonly active = computed(() => {
    const task = this.task();
    return task ? isTaskActive(task.status) : false;
  });

  readonly duration = computed(() => {
    const task = this.task();
    return task ? taskDuration(task.start, task.end) : '—';
  });

  readonly tone = computed(() => statusTone(this.task()?.status ?? 'waiting'));

  readonly label = computed(() => statusLabel(this.task()?.status ?? 'waiting'));

  readonly statusLabel = statusLabel;

  readonly rawLogUrl = `api/project/${this.projectId}/tasks/${this.taskId}/raw_output`;

  constructor() {
    const timer = setInterval(() => {
      if (this.active()) {
        void this.load();
      }
    }, 2500);

    inject(DestroyRef).onDestroy(() => clearInterval(timer));
    void this.load();
  }

  async stop(force = false): Promise<void> {
    await this.act(`stop`, { force });
  }

  async confirm(): Promise<void> {
    await this.act('confirm');
  }

  async reject(): Promise<void> {
    await this.act('reject');
  }

  private async act(action: string, body?: unknown): Promise<void> {
    this.busy.set(true);
    try {
      await firstValueFrom(this.api.post(`project/${this.projectId}/tasks/${this.taskId}/${action}`, body));
      await this.load();
    } finally {
      this.busy.set(false);
    }
  }

  private async load(): Promise<void> {
    const base = `project/${this.projectId}/tasks/${this.taskId}`;

    const [task, output] = await Promise.all([
      firstValueFrom(this.api.get<Task>(base)),
      firstValueFrom(this.api.get<TaskOutput[]>(`${base}/output`)),
    ]);

    this.task.set(task ?? null);
    this.lines.set(
      (output ?? []).map((entry) => ({
        id: entry.id,
        time: entry.time,
        html: ansiToHtml(entry.output),
      })),
    );
    this.loading.set(false);
  }
}
