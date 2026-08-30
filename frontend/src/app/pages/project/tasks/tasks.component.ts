import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  UiDataTableComponent,
  UiPageHeaderComponent,
  UiTdDirective,
  type UiColumn,
} from '@globalart/platform-ui';
import { ApiService } from '../../../core/api.service';
import type { Task } from '../../../core/models';
import { statusAccent, statusLabel, statusTone, taskDuration } from '../../../core/task-status';

@Component({
  selector: 'aldis-tasks',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    TranslatePipe,
    UiDataTableComponent,
    UiPageHeaderComponent,
    UiTdDirective,
  ],
  host: { class: 'flex flex-col gap-6' },
  templateUrl: './tasks.component.html',
})
export class TasksComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);

  readonly projectId = Number(this.route.parent?.snapshot.paramMap.get('id'));
  readonly tasks = signal<Task[] | null>(null);

  private readonly labels = signal(0);

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

  readonly statusTone = statusTone;
  readonly statusLabel = statusLabel;
  readonly duration = taskDuration;

  readonly rowSearch = (row: Task, search: string): boolean =>
    `${row.id} ${row.tpl_alias ?? ''} ${row.user_name ?? ''}`.toLowerCase().includes(search.toLowerCase());

  constructor() {
    const bump = () => this.labels.update((value) => value + 1);
    this.translate.onLangChange.subscribe(bump);
    this.translate.onTranslationChange.subscribe(bump);

    void firstValueFrom(this.api.get<Task[]>(`project/${this.projectId}/tasks`, { limit: 200 })).then((tasks) =>
      this.tasks.set(tasks ?? []),
    );
  }
}
