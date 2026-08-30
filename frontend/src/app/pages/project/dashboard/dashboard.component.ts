import { DatePipe, KeyValuePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  UiBadgeComponent,
  UiButtonDirective,
  UiCardComponent,
  UiDataTableComponent,
  UiEmptyStateComponent,
  UiFieldDirective,
  UiInputDirective,
  UiLabelDirective,
  UiPageHeaderComponent,
  UiStatComponent,
  UiSwitchComponent,
  UiTabsComponent,
  UiTdDirective,
  type UiColumn,
  type UiTab,
} from '@globalart/platform-ui';
import { ApiService } from '../../../core/api.service';
import type { Project, Task, TaskStat } from '../../../core/models';
import { ProjectService } from '../../../core/project.service';
import { statusAccent, statusLabel, statusTone, taskDuration } from '../../../core/task-status';

interface ProjectEvent {
  description: string;
  created: string;
  username?: string;
  object_type?: string;
}

@Component({
  selector: 'aldis-project-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    KeyValuePipe,
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    UiBadgeComponent,
    UiButtonDirective,
    UiCardComponent,
    UiDataTableComponent,
    UiEmptyStateComponent,
    UiFieldDirective,
    UiInputDirective,
    UiLabelDirective,
    UiPageHeaderComponent,
    UiStatComponent,
    UiSwitchComponent,
    UiTabsComponent,
    UiTdDirective,
  ],
  host: { class: 'flex flex-col gap-6' },
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly projects = inject(ProjectService);
  private readonly translate = inject(TranslateService);

  readonly projectId = Number(this.route.parent?.snapshot.paramMap.get('id'));
  readonly project = this.projects.current;

  readonly tasks = signal<Task[] | null>(null);
  readonly stats = signal<TaskStat[]>([]);
  readonly events = signal<ProjectEvent[]>([]);
  readonly saving = signal(false);
  readonly active = signal('history');

  readonly settings = this.fb.nonNullable.group({
    name: '',
    max_parallel_tasks: 0,
    alert: false,
  });

  private readonly labels = signal(0);

  readonly tabs = computed<UiTab[]>(() => {
    this.labels();
    return ['history', 'stats', 'activity', 'settings'].map((id) => ({
      id,
      label: this.translate.instant(id) as string,
    }));
  });

  readonly columns = computed<UiColumn[]>(() => {
    this.labels();

    return [
      { title: this.translate.instant('columnTask') as string, width: '46%' },
      { title: this.translate.instant('version') as string, width: '120px' },
      { title: this.translate.instant('user') as string, width: '180px' },
      { title: this.translate.instant('start') as string, width: '150px' },
      { title: this.translate.instant('duration') as string, width: '100px', align: 'right' },
    ];
  });

  readonly accent = (row: Task) => statusAccent(row.status);

  readonly countByStatus = computed(() => {
    const totals: Record<string, number> = {};
    for (const day of this.stats()) {
      for (const [status, count] of Object.entries(day.count_by_status ?? {})) {
        totals[status] = (totals[status] ?? 0) + count;
      }
    }
    return totals;
  });

  readonly totalTasks = computed(() =>
    Object.values(this.countByStatus()).reduce((sum, count) => sum + count, 0),
  );

  readonly statusTone = statusTone;
  readonly statusLabel = statusLabel;
  readonly duration = taskDuration;

  readonly rowSearch = (row: Task, search: string): boolean =>
    `${row.id} ${row.tpl_alias ?? ''} ${row.user_name ?? ''}`.toLowerCase().includes(search.toLowerCase());

  constructor() {
    const bump = () => this.labels.update((value) => value + 1);
    this.translate.onLangChange.subscribe(bump);
    this.translate.onTranslationChange.subscribe(bump);

    void this.load();
  }

  count(status: string): number {
    return this.countByStatus()[status] ?? 0;
  }

  select(tab: string): void {
    this.active.set(tab);
  }

  async save(): Promise<void> {
    this.saving.set(true);
    try {
      const project = await firstValueFrom(
        this.api.put<Project>(`project/${this.projectId}`, {
          id: this.projectId,
          ...this.settings.getRawValue(),
        }),
      );
      this.projects.current.set(project ?? this.project());
    } finally {
      this.saving.set(false);
    }
  }

  private async load(): Promise<void> {
    const base = `project/${this.projectId}`;

    const [tasks, stats, events] = await Promise.all([
      firstValueFrom(this.api.get<Task[]>(`${base}/tasks`, { limit: 200 })),
      firstValueFrom(this.api.get<TaskStat[]>(`${base}/stats`)),
      firstValueFrom(this.api.get<ProjectEvent[]>(`${base}/events`)),
    ]);

    this.tasks.set(tasks ?? []);
    this.stats.set(stats ?? []);
    this.events.set(events ?? []);

    const project = this.project();
    if (project) {
      this.settings.patchValue({
        name: project.name,
        max_parallel_tasks: project.max_parallel_tasks ?? 0,
        alert: project.alert ?? false,
      });
    }
  }
}
