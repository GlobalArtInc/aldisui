import { Component, EventEmitter, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { catchError, firstValueFrom, of } from 'rxjs';
import {
  UiAlertComponent,
  UiBadgeComponent,
  UiButtonDirective,
  UiColumn,
  UiConfirmModalComponent,
  UiDataTableComponent,
  UiIconComponent,
  UiPageHeaderComponent,
  UiTdDirective,
} from '@globalart/platform-ui';
import { ApiService } from '../../../core/api.service';
import { ResourceFormComponent } from './resource-form.component';
import type { ResourceConfig, ResourceOption, ResourceOptionSource } from './resource.model';

type Row = Record<string, unknown>;

@Component({
  selector: 'aldis-resource-list',
  standalone: true,
  imports: [
    TranslatePipe,
    UiAlertComponent,
    UiBadgeComponent,
    UiButtonDirective,
    UiConfirmModalComponent,
    UiDataTableComponent,
    UiIconComponent,
    UiPageHeaderComponent,
    UiTdDirective,
    ResourceFormComponent,
  ],
  host: { class: 'flex flex-col gap-6' },
  templateUrl: './resource-list.component.html',
})
export class ResourceListComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);

  readonly config = this.route.snapshot.data['resource'] as ResourceConfig;
  readonly projectId = Number(this.route.parent?.snapshot.paramMap.get('id'));

  readonly rows = signal<Row[] | null>(null);
  readonly failed = signal(false);
  readonly editing = signal<Row | null>(null);
  readonly formOpen = signal(false);
  readonly removing = signal<Row | null>(null);
  readonly options = signal<Record<string, ResourceOption[]>>({});
  readonly reload = new EventEmitter<unknown>();

  private readonly labels = signal(0);

  readonly columns = computed<UiColumn[]>(() => {
    this.labels();

    return [
      ...this.config.columns.map((column) => ({
        title: column.title ? (this.translate.instant(column.title) as string) : '',
        align: column.align,
        width: column.width,
      })),
      ...(this.config.fields ? [{ title: '', align: 'right' as const, width: '110px' }] : []),
    ];
  });

  readonly rowSearch = (row: Row, search: string): boolean =>
    this.config.columns
      .map((column) => String(row[column.field] ?? ''))
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase());

  constructor() {
    const bump = () => this.labels.update((value) => value + 1);
    this.translate.onLangChange.subscribe(bump);
    this.translate.onTranslationChange.subscribe(bump);

    void this.load();
    void this.loadOptions();
  }

  cell(row: Row, field: string): string {
    const value = row[field];
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  }

  bool(row: Row, field: string): boolean {
    return Boolean(row[field]);
  }

  create(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  edit(row: Row): void {
    this.editing.set(row);
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
    const row = this.removing();
    this.removing.set(null);

    if (!row) {
      return;
    }

    await firstValueFrom(this.api.delete(`project/${this.projectId}/${this.config.path}/${row['id']}`));
    await this.load();
  }

  private async load(): Promise<void> {
    const rows = await firstValueFrom(
      this.api.get<Row[]>(`project/${this.projectId}/${this.config.path}`).pipe(
        catchError(() => {
          this.failed.set(true);
          return of([] as Row[]);
        }),
      ),
    );

    this.rows.set(rows ?? []);
    this.reload.emit(null);
  }

  private async loadOptions(): Promise<void> {
    const sources = new Set(
      (this.config.fields ?? []).map((field) => field.source).filter(Boolean) as ResourceOptionSource[],
    );

    for (const source of sources) {
      const path = source === 'users' ? 'users' : `project/${this.projectId}/${source}`;
      const items = await firstValueFrom(
        this.api.get<Row[]>(path).pipe(catchError(() => of([] as Row[]))),
      );

      this.options.update((current) => ({
        ...current,
        [source]: (items ?? []).map((item) => ({
          label: String(item['name'] ?? item['username'] ?? item['id']),
          value: Number(item['id']),
        })),
      }));
    }
  }
}
