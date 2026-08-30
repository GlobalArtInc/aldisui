import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  UiBadgeComponent,
  UiButtonDirective,
  UiDataTableComponent,
  UiIconComponent,
  UiPageHeaderComponent,
  UiTdDirective,
  type UiColumn,
} from '@globalart/platform-ui';
import { ApiService } from '../../../core/api.service';
import type { Task, Template } from '../../../core/models';
import { statusLabel, statusTone } from '../../../core/task-status';

@Component({
  selector: 'aldis-templates',
  standalone: true,
  imports: [
    RouterLink,
    TranslatePipe,
    UiBadgeComponent,
    UiButtonDirective,
    UiDataTableComponent,
    UiIconComponent,
    UiPageHeaderComponent,
    UiTdDirective,
  ],
  templateUrl: './templates.component.html',
})
export class TemplatesComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly projectId = Number(this.route.parent?.snapshot.paramMap.get('id'));
  readonly templates = signal<Template[] | null>(null);
  readonly running = signal<number | null>(null);

  readonly columns: UiColumn[] = [
    { title: 'ID', width: '80px' },
    { title: 'Name', sortable: true, sortKey: 'name' },
    { title: 'Playbook' },
    { title: 'Type' },
    { title: 'Last task' },
    { title: '', align: 'right', width: '120px' },
  ];

  readonly statusTone = statusTone;
  readonly statusLabel = statusLabel;

  readonly rowSearch = (row: Template, search: string): boolean =>
    `${row.name} ${row.playbook}`.toLowerCase().includes(search.toLowerCase());

  constructor() {
    void firstValueFrom(this.api.get<Template[]>(`project/${this.projectId}/templates`)).then((templates) =>
      this.templates.set(templates ?? []),
    );
  }

  async run(template: Template): Promise<void> {
    this.running.set(template.id);
    try {
      const task = await firstValueFrom(
        this.api.post<Task>(`project/${this.projectId}/tasks`, { template_id: template.id }),
      );
      await this.router.navigate(['/project', this.projectId, 'tasks', task.id]);
    } finally {
      this.running.set(null);
    }
  }
}
