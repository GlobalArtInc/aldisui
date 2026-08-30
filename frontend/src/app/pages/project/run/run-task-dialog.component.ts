import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
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
import type { SurveyVar, Task, Template } from '../../../core/models';

@Component({
  selector: 'aldis-run-task-dialog',
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
  templateUrl: './run-task-dialog.component.html',
})
export class RunTaskDialogComponent {
  private readonly api = inject(ApiService);
  private readonly translate = inject(TranslateService);

  @Input({ required: true }) projectId!: number;

  @Input() set template(value: Template | null) {
    this.current.set(value);
    this.values.set(this.defaults(value));
    this.message.set('');
    this.reason.set('');
  }

  @Output() readonly started = new EventEmitter<Task>();
  @Output() readonly closed = new EventEmitter<void>();

  readonly current = signal<Template | null>(null);
  readonly values = signal<Record<string, string>>({});
  readonly message = signal('');
  readonly debug = signal(false);
  readonly dryRun = signal(false);
  readonly diff = signal(false);
  readonly busy = signal(false);
  readonly reason = signal('');

  readonly vars = computed<SurveyVar[]>(() => this.current()?.survey_vars ?? []);

  readonly config = computed<UiModalConfig>(() => ({
    title: this.current()?.name ?? this.t('run'),
    size: 'md',
    confirmButton: { label: this.t('run'), variant: 'primary', loading: this.busy() },
    closeButton: { label: this.t('close') },
  }));

  set(name: string, value: unknown): void {
    this.values.update((current) => ({ ...current, [name]: value == null ? '' : String(value) }));
  }

  value(name: string): string {
    return this.values()[name] ?? '';
  }

  async action(id: string): Promise<void> {
    if (id === 'confirm') {
      await this.run();
      return;
    }
    this.closed.emit();
  }

  private async run(): Promise<void> {
    const template = this.current();
    if (!template) {
      return;
    }

    this.busy.set(true);
    this.reason.set('');

    try {
      const task = await firstValueFrom(
        this.api.post<Task>(`project/${this.projectId}/tasks`, {
          template_id: template.id,
          message: this.message(),
          environment: JSON.stringify(this.values()),
          params: {
            debug: this.debug(),
            dry_run: this.dryRun(),
            diff: this.diff(),
          },
        }),
      );
      this.started.emit(task);
    } catch (error) {
      this.reason.set(this.describe(error));
    } finally {
      this.busy.set(false);
    }
  }

  private defaults(template: Template | null): Record<string, string> {
    const values: Record<string, string> = {};
    for (const variable of template?.survey_vars ?? []) {
      const fallback = variable.default_value;
      values[variable.name] = Array.isArray(fallback) ? (fallback[0] ?? '') : (fallback ?? '');
    }
    return values;
  }

  private describe(error: unknown): string {
    const body = (error as { error?: { error?: string } } | null)?.error;

    if (body && typeof body.error === 'string') {
      return body.error;
    }

    return this.t('unknownError');
  }

  private t(key: string): string {
    return this.translate.instant(key) as string;
  }
}
