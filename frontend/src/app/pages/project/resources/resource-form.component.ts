import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  UiAlertComponent,
  UiFieldDirective,
  UiInputDirective,
  UiLabelDirective,
  UiModalComponent,
  UiSelectComponent,
  UiSwitchComponent,
  type UiModalConfig,
} from '@globalart/platform-ui';
import { ApiService } from '../../../core/api.service';
import type { ResourceConfig, ResourceField, ResourceOption } from './resource.model';

type Row = Record<string, unknown>;

@Component({
  selector: 'aldis-resource-form',
  standalone: true,
  imports: [
    FormsModule,
    TranslatePipe,
    UiAlertComponent,
    UiFieldDirective,
    UiInputDirective,
    UiLabelDirective,
    UiModalComponent,
    UiSelectComponent,
    UiSwitchComponent,
  ],
  templateUrl: './resource-form.component.html',
})
export class ResourceFormComponent {
  private readonly api = inject(ApiService);
  private readonly translate = inject(TranslateService);

  @Input({ required: true }) projectId!: number;
  @Input({ required: true }) config!: ResourceConfig;
  @Input() options: Record<string, ResourceOption[]> = {};

  @Input() set row(value: Row | null) {
    this.current.set(value);
    this.values.set(value ? this.fromRow(value) : this.defaults());
    this.failed.set(false);
  }

  @Output() readonly saved = new EventEmitter<void>();
  @Output() readonly closed = new EventEmitter<void>();

  readonly current = signal<Row | null>(null);
  readonly open = signal(false);
  readonly values = signal<Record<string, unknown>>({});
  readonly busy = signal(false);
  readonly failed = signal(false);

  readonly fields = computed(() =>
    (this.config?.fields ?? []).filter((field) => this.visible(field)),
  );

  readonly modal = computed<UiModalConfig>(() => ({
    title: this.title(),
    size: 'md',
    confirmButton: { label: this.t('save'), variant: 'primary', loading: this.busy() },
    closeButton: { label: this.t('cancel') },
  }));

  @Input() set opened(value: boolean) {
    this.open.set(value);
  }

  value(field: ResourceField): unknown {
    return this.values()[field.name] ?? '';
  }

  set(field: ResourceField, value: unknown): void {
    this.values.update((current) => ({ ...current, [field.name]: value }));
  }

  choices(field: ResourceField): ResourceOption[] {
    return field.source ? (this.options[field.source] ?? []) : (field.options ?? []);
  }

  async action(id: string): Promise<void> {
    if (id !== 'confirm') {
      this.closed.emit();
      return;
    }

    this.busy.set(true);
    this.failed.set(false);

    try {
      const body = this.payload();
      const row = this.current();

      if (row) {
        await firstValueFrom(this.api.put(`project/${this.projectId}/${this.config.path}/${row['id']}`, body));
      } else {
        await firstValueFrom(this.api.post(`project/${this.projectId}/${this.config.path}`, body));
      }

      this.saved.emit();
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }

  private title(): string {
    if (this.current()) {
      return this.t('edit');
    }
    return this.t(this.config?.createKey ?? 'create');
  }

  private visible(field: ResourceField): boolean {
    if (!field.when) {
      return true;
    }
    return field.when.is.includes(String(this.values()[field.when.field] ?? ''));
  }

  private defaults(): Record<string, unknown> {
    const values: Record<string, unknown> = {};
    for (const field of this.config?.fields ?? []) {
      values[field.name] = field.value ?? (field.type === 'switch' ? false : '');
    }
    return values;
  }

  private fromRow(row: Row): Record<string, unknown> {
    const values = this.defaults();
    for (const field of this.config?.fields ?? []) {
      const value = field.name.split('.').reduce<unknown>((carry, part) => {
        return carry && typeof carry === 'object' ? (carry as Row)[part] : undefined;
      }, row);

      if (value !== undefined && value !== null) {
        values[field.name] = value;
      }
    }
    return values;
  }

  private payload(): Record<string, unknown> {
    const body: Record<string, unknown> = { project_id: this.projectId };
    const row = this.current();
    if (row) {
      body['id'] = row['id'];
    }

    for (const field of this.fields()) {
      const raw = this.values()[field.name];
      const value = field.type === 'number' && raw !== '' ? Number(raw) : raw;
      const parts = field.name.split('.');

      let target = body;
      for (const part of parts.slice(0, -1)) {
        target[part] = target[part] ?? {};
        target = target[part] as Record<string, unknown>;
      }
      target[parts[parts.length - 1]] = value;
    }

    return body;
  }

  private t(key: string): string {
    return this.translate.instant(key) as string;
  }
}
