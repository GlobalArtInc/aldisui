import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  UiBadgeComponent,
  UiDataTableComponent,
  UiPageHeaderComponent,
  UiTdDirective,
  type UiColumn,
} from '@globalart/platform-ui';
import { ApiService } from '../../../core/api.service';
import type { Task } from '../../../core/models';
import { statusLabel, statusTone, taskDuration } from '../../../core/task-status';

@Component({
  selector: 'aldis-tasks',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    TranslatePipe,
    UiBadgeComponent,
    UiDataTableComponent,
    UiPageHeaderComponent,
    UiTdDirective,
  ],
  templateUrl: './tasks.component.html',
})
export class TasksComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  readonly projectId = Number(this.route.parent?.snapshot.paramMap.get('id'));
  readonly tasks = signal<Task[] | null>(null);

  readonly columns: UiColumn[] = [
    { title: 'ID', width: '80px' },
    { title: 'Template' },
    { title: 'Status' },
    { title: 'User' },
    { title: 'Start' },
    { title: 'Duration', align: 'right' },
  ];

  readonly statusTone = statusTone;
  readonly statusLabel = statusLabel;
  readonly duration = taskDuration;

  readonly rowSearch = (row: Task, search: string): boolean =>
    `${row.id} ${row.tpl_alias ?? ''} ${row.user_name ?? ''}`.toLowerCase().includes(search.toLowerCase());

  constructor() {
    void firstValueFrom(this.api.get<Task[]>(`project/${this.projectId}/tasks`, { limit: 200 })).then((tasks) =>
      this.tasks.set(tasks ?? []),
    );
  }
}
