import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  UiBadgeComponent,
  UiButtonDirective,
  UiDataTableComponent,
  UiIconComponent,
  UiConfirmModalComponent,
  UiPageHeaderComponent,
  UiTdDirective,
  type UiColumn,
} from '@globalart/platform-ui';
import { ApiService } from '../../../core/api.service';
import { RunTaskDialogComponent } from '../run/run-task-dialog.component';
import { TemplateDialogComponent } from './template-dialog.component';
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
    UiConfirmModalComponent,
    RunTaskDialogComponent,
    TemplateDialogComponent,
  ],
  host: { class: 'flex flex-col gap-6' },
  templateUrl: './templates.component.html',
})
export class TemplatesComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly projectId = Number(this.route.parent?.snapshot.paramMap.get('id'));
  readonly templates = signal<Template[] | null>(null);
  readonly selected = signal<Template | null>(null);
  readonly editing = signal<Template | null>(null);
  readonly formOpen = signal(false);
  readonly removing = signal<Template | null>(null);

  readonly columns: UiColumn[] = [
    { title: 'ID', width: '80px' },
    { title: 'Name', sortable: true, sortKey: 'name' },
    { title: 'Playbook' },
    { title: 'Type' },
    { title: 'Last task' },
    { title: '', align: 'right', width: '200px' },
  ];

  readonly statusTone = statusTone;
  readonly statusLabel = statusLabel;

  readonly rowSearch = (row: Template, search: string): boolean =>
    `${row.name} ${row.playbook}`.toLowerCase().includes(search.toLowerCase());

  constructor() {
    void this.load();
  }

  create(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  edit(template: Template): void {
    this.editing.set(template);
    this.formOpen.set(true);
  }

  close(): void {
    this.formOpen.set(false);
    this.editing.set(null);
  }

  async saved(): Promise<void> {
    this.close();
    await this.load();
  }

  async remove(): Promise<void> {
    const template = this.removing();
    this.removing.set(null);

    if (!template) {
      return;
    }

    await firstValueFrom(this.api.delete(`project/${this.projectId}/templates/${template.id}`));
    await this.load();
  }

  private async load(): Promise<void> {
    const templates = await firstValueFrom(this.api.get<Template[]>(`project/${this.projectId}/templates`));
    this.templates.set(templates ?? []);
  }

  open(template: Template): void {
    this.selected.set(template);
  }

  async started(task: Task): Promise<void> {
    this.selected.set(null);
    await this.router.navigate(['/project', this.projectId, 'tasks', task.id]);
  }
}
