import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { catchError, firstValueFrom, of } from 'rxjs';
import {
  UiAlertComponent,
  UiFieldDirective,
  UiHintDirective,
  UiInputDirective,
  UiLabelDirective,
  UiModalComponent,
  UiSelectComponent,
  UiSwitchComponent,
  type UiModalConfig,
} from '@globalart/platform-ui';
import { ApiService } from '../../../core/api.service';
import type { Template } from '../../../core/models';

interface Option {
  label: string;
  value: number;
}

const APPS = ['ansible', 'terraform', 'tofu', 'terragrunt', 'bash', 'powershell', 'python', 'pulumi'];

@Component({
  selector: 'aldis-template-dialog',
  standalone: true,
  imports: [
    FormsModule,
    TranslatePipe,
    UiAlertComponent,
    UiFieldDirective,
    UiHintDirective,
    UiInputDirective,
    UiLabelDirective,
    UiModalComponent,
    UiSelectComponent,
    UiSwitchComponent,
  ],
  templateUrl: './template-dialog.component.html',
})
export class TemplateDialogComponent {
  private readonly api = inject(ApiService);
  private readonly translate = inject(TranslateService);

  @Input({ required: true }) projectId!: number;

  @Input() set template(value: Template | null | undefined) {
    this.current.set(value ?? null);
    this.failed.set(false);

    this.name.set(value?.name ?? '');
    this.description.set(value?.description ?? '');
    this.playbook.set(value?.playbook ?? '');
    this.app.set(value?.app ?? 'ansible');
    this.repository.set(value?.repository_id ?? null);
    this.inventory.set(value?.inventory_id ?? null);
    this.environments.set(value?.environment_ids ?? []);
    this.args.set(value?.arguments ?? '[]');
    this.branch.set(value?.git_branch ?? '');
    this.overrideArgs.set(value?.allow_override_args_in_task ?? false);
  }

  @Input() set opened(value: boolean) {
    this.open.set(value);
  }

  @Output() readonly saved = new EventEmitter<Template>();
  @Output() readonly closed = new EventEmitter<void>();

  readonly open = signal(false);
  readonly current = signal<Template | null>(null);
  readonly busy = signal(false);
  readonly failed = signal(false);

  readonly name = signal('');
  readonly description = signal('');
  readonly playbook = signal('');
  readonly app = signal<string>('ansible');
  readonly repository = signal<number | null>(null);
  readonly inventory = signal<number | null>(null);
  readonly environments = signal<number[]>([]);
  readonly args = signal('[]');
  readonly branch = signal('');
  readonly overrideArgs = signal(false);

  readonly repositories = signal<Option[]>([]);
  readonly inventories = signal<Option[]>([]);
  readonly groups = signal<Option[]>([]);

  readonly apps: Option[] | { label: string; value: string }[] = APPS.map((app) => ({
    label: app,
    value: app,
  }));

  readonly config = computed<UiModalConfig>(() => ({
    title: this.current() ? this.t('editTemplate') : this.t('newTemplate'),
    size: 'lg',
    confirmButton: { label: this.t('save'), variant: 'primary', loading: this.busy() },
    closeButton: { label: this.t('cancel') },
  }));

  constructor() {
    void this.loadOptions();
  }

  async action(id: string): Promise<void> {
    if (id !== 'confirm') {
      this.closed.emit();
      return;
    }

    this.busy.set(true);
    this.failed.set(false);

    try {
      const template = await this.save();
      this.saved.emit(template);
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }

  private save(): Promise<Template> {
    const environments = this.environments();

    const body = {
      project_id: this.projectId,
      name: this.name(),
      description: this.description(),
      playbook: this.playbook(),
      app: this.app(),
      type: '',
      repository_id: Number(this.repository()),
      inventory_id: this.inventory() === null ? null : Number(this.inventory()),
      environment_ids: environments.map(Number),
      environment_id: environments.length ? Number(environments[0]) : 0,
      arguments: this.args(),
      git_branch: this.branch() || null,
      allow_override_args_in_task: this.overrideArgs(),
    };

    const existing = this.current();

    return existing
      ? firstValueFrom(
          this.api.put<Template>(`project/${this.projectId}/templates/${existing.id}`, {
            ...body,
            id: existing.id,
          }),
        )
      : firstValueFrom(this.api.post<Template>(`project/${this.projectId}/templates`, body));
  }

  private async loadOptions(): Promise<void> {
    const [repositories, inventories, groups] = await Promise.all([
      this.list('repositories'),
      this.list('inventory'),
      this.list('environment'),
    ]);

    this.repositories.set(repositories);
    this.inventories.set(inventories);
    this.groups.set(groups);
  }

  private async list(path: string): Promise<Option[]> {
    const items = await firstValueFrom(
      this.api
        .get<Record<string, unknown>[]>(`project/${this.projectId}/${path}`)
        .pipe(catchError(() => of([] as Record<string, unknown>[]))),
    );

    return (items ?? []).map((item) => ({
      label: String(item['name'] ?? item['id']),
      value: Number(item['id']),
    }));
  }

  private t(key: string): string {
    return this.translate.instant(key) as string;
  }
}
