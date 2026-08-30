import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import {
  UiBadgeComponent,
  UiButtonDirective,
  UiDescriptionListComponent,
  UiDescriptionRowComponent,
  UiIconComponent,
  UiModalComponent,
  UiTabsComponent,
  type UiModalConfig,
  type UiTab,
} from '@globalart/platform-ui';
import { ansiToHtml, stripAnsi } from '../../../core/ansi';
import { readFlag, writeFlag } from '../../../core/preferences';
import { TaskLogComponent, type TaskLogLine } from './task-log.component';
import { ApiService } from '../../../core/api.service';
import type { Task, TaskOutput } from '../../../core/models';
import { isTaskActive, statusLabel, statusTone, taskDuration } from '../../../core/task-status';

const EXPANDED = 'aldis.task-dialog-expanded';

@Component({
  selector: 'aldis-task-dialog',
  standalone: true,
  imports: [
    DatePipe,
    TranslatePipe,
    UiBadgeComponent,
    UiButtonDirective,
    UiDescriptionListComponent,
    UiDescriptionRowComponent,
    UiIconComponent,
    UiModalComponent,
    UiTabsComponent,
    TaskLogComponent,
  ],
  templateUrl: './task-dialog.component.html',
})
export class TaskDialogComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly taskId = toSignal(
    this.route.queryParamMap.pipe(map((params) => Number(params.get('t')) || null)),
    { initialValue: null },
  );

  readonly projectId = Number(this.route.snapshot.paramMap.get('id'));

  readonly task = signal<Task | null>(null);
  readonly lines = signal<TaskLogLine[]>([]);
  readonly busy = signal(false);
  readonly fullscreen = signal(readFlag(EXPANDED));
  readonly tab = signal('log');

  private readonly labels = signal(0);

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

  readonly tabs = computed<UiTab[]>(() => {
    this.labels();
    return [
      { id: 'log', label: this.t('output') },
      { id: 'details', label: this.t('details') },
    ];
  });

  readonly config = computed<UiModalConfig>(() => ({
    title: this.title(),
    size: 'xl',
    fullscreen: this.fullscreen(),
    scrollBody: this.tab() !== 'log',
    showHeaderClose: true,
  }));

  readonly rawLogUrl = computed(() => `api/project/${this.projectId}/tasks/${this.taskId()}/raw_output`);

  constructor() {
    const timer = setInterval(() => {
      if (this.active()) {
        void this.load();
      }
    }, 2500);

    inject(DestroyRef).onDestroy(() => clearInterval(timer));

    const bump = () => this.labels.update((value) => value + 1);
    this.translate.onLangChange.subscribe(bump);
    this.translate.onTranslationChange.subscribe(bump);

    effect(() => {
      const id = this.taskId();
      if (id === null) {
        this.task.set(null);
        this.lines.set([]);
        return;
      }
      void this.load();
    });
  }

  close(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { t: null },
      queryParamsHandling: 'merge',
    });
  }

  toggleSize(): void {
    this.fullscreen.update((value) => !value);
    writeFlag(EXPANDED, this.fullscreen());
  }

  async stop(): Promise<void> {
    await this.act('stop');
  }

  async confirm(): Promise<void> {
    await this.act('confirm');
  }

  async reject(): Promise<void> {
    await this.act('reject');
  }

  private title(): string {
    const task = this.task();
    const id = this.taskId();
    const name = task?.tpl_alias ? `${task.tpl_alias} — ` : '';
    return `${name}${this.translate.instant('task', { expr: id ?? '' })}`;
  }

  private async act(action: string): Promise<void> {
    this.busy.set(true);
    try {
      await firstValueFrom(
        this.api.post(`project/${this.projectId}/tasks/${this.taskId()}/${action}`, {}),
      );
      await this.load();
    } finally {
      this.busy.set(false);
    }
  }

  private async load(): Promise<void> {
    const id = this.taskId();
    if (id === null) {
      return;
    }

    const base = `project/${this.projectId}/tasks/${id}`;

    const [task, output] = await Promise.all([
      firstValueFrom(this.api.get<Task>(base)),
      firstValueFrom(this.api.get<TaskOutput[]>(`${base}/output`)),
    ]);

    this.task.set(task ?? null);
    this.lines.set(
      (output ?? []).map((entry, index) => ({
        id: entry.id || index,
        time: entry.time,
        text: stripAnsi(entry.output),
        html: ansiToHtml(entry.output),
      })),
    );
  }

  private t(key: string): string {
    return this.translate.instant(key) as string;
  }
}
