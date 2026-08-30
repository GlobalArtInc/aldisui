import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { catchError, firstValueFrom, of } from 'rxjs';
import {
  UiBadgeComponent,
  UiButtonDirective,
  UiCardComponent,
  UiColumn,
  UiDataTableComponent,
  UiDescriptionListComponent,
  UiDescriptionRowComponent,
  UiIconComponent,
  UiPageAsideComponent,
  UiPageColumnsComponent,
  UiPageHeaderComponent,
  UiSpinnerComponent,
  UiStatComponent,
  UiTdDirective,
} from '@globalart/platform-ui';
import { ApiService } from '../../../core/api.service';
import { RunTaskDialogComponent } from '../run/run-task-dialog.component';
import { TemplateDialogComponent } from '../templates/template-dialog.component';
import type { Task, Template } from '../../../core/models';
import { statusAccent, taskDuration } from '../../../core/task-status';

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
    UiDataTableComponent,
    UiDescriptionListComponent,
    UiDescriptionRowComponent,
    UiIconComponent,
    UiPageAsideComponent,
    UiPageColumnsComponent,
    UiPageHeaderComponent,
    UiSpinnerComponent,
    UiStatComponent,
    UiTdDirective,
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
  private readonly translate = inject(TranslateService);

  readonly projectId = Number(this.route.parent?.snapshot.paramMap.get('id'));
  readonly templateId = Number(this.route.snapshot.paramMap.get('templateId'));

  readonly template = signal<Template | null>(null);
  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(true);
  readonly selected = signal<Template | null>(null);
  readonly formOpen = signal(false);

  readonly duration = taskDuration;
  readonly accent = (row: Task) => statusAccent(row.status);

  private readonly labels = signal(0);

  readonly columns = computed<UiColumn[]>(() => {
    this.labels();

    return [
      { title: this.t('columnTask'), width: '44%' },
      { title: this.t('version'), width: '120px' },
      { title: this.t('user'), width: '180px' },
      { title: this.t('start'), width: '150px' },
      { title: this.t('duration'), width: '100px', align: 'right' },
    ];
  });

  readonly rowSearch = (row: Task, search: string): boolean =>
    `${row.id} ${row.user_name ?? ''} ${row.commit_message ?? ''}`.toLowerCase().includes(search.toLowerCase());

  readonly repositories = signal<Record<number, string>>({});
  readonly inventories = signal<Record<number, string>>({});
  readonly groups = signal<Record<number, string>>({});

  readonly repositoryName = computed(
    () => this.repositories()[this.template()?.repository_id ?? -1] ?? '—',
  );

  readonly inventoryName = computed(() => this.inventories()[this.template()?.inventory_id ?? -1] ?? '—');

  readonly groupNames = computed(() => {
    const names = (this.template()?.environment_ids ?? []).map((id) => this.groups()[id]).filter(Boolean);
    return names.length ? names.join(', ') : '—';
  });

  constructor() {
    const bump = () => this.labels.update((value) => value + 1);
    this.translate.onLangChange.subscribe(bump);
    this.translate.onTranslationChange.subscribe(bump);

    void this.load();
    void this.loadNames();
  }

  private async loadNames(): Promise<void> {
    const [repositories, inventories, groups] = await Promise.all([
      this.names('repositories'),
      this.names('inventory'),
      this.names('environment'),
    ]);

    this.repositories.set(repositories);
    this.inventories.set(inventories);
    this.groups.set(groups);
  }

  private async names(path: string): Promise<Record<number, string>> {
    const items = await firstValueFrom(
      this.api
        .get<Record<string, unknown>[]>(`project/${this.projectId}/${path}`)
        .pipe(catchError(() => of([] as Record<string, unknown>[]))),
    );

    return Object.fromEntries((items ?? []).map((item) => [Number(item['id']), String(item['name'])]));
  }

  private t(key: string): string {
    return this.translate.instant(key) as string;
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
