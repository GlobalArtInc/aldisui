import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, firstValueFrom, of } from 'rxjs';
import {
  UiAlertComponent,
  UiBadgeComponent,
  UiColumn,
  UiDataTableComponent,
  UiPageHeaderComponent,
  UiTdDirective,
} from '@globalart/platform-ui';
import { ApiService } from '../../../core/api.service';
import type { ResourceConfig } from './resource.model';

type Row = Record<string, unknown>;

@Component({
  selector: 'aldis-resource-list',
  standalone: true,
  imports: [
    TranslatePipe,
    UiAlertComponent,
    UiBadgeComponent,
    UiDataTableComponent,
    UiPageHeaderComponent,
    UiTdDirective,
  ],
  host: { class: 'flex flex-col gap-6' },
  templateUrl: './resource-list.component.html',
})
export class ResourceListComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  readonly config = this.route.snapshot.data['resource'] as ResourceConfig;
  readonly projectId = Number(this.route.parent?.snapshot.paramMap.get('id'));

  readonly rows = signal<Row[] | null>(null);
  readonly failed = signal(false);

  readonly columns: UiColumn[] = this.config.columns.map((column) => ({
    title: column.title,
    align: column.align,
    width: column.width,
  }));

  readonly rowSearch = (row: Row, search: string): boolean =>
    this.config.columns
      .map((column) => String(row[column.field] ?? ''))
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase());

  constructor() {
    void firstValueFrom(
      this.api.get<Row[]>(`project/${this.projectId}/${this.config.path}`).pipe(
        catchError(() => {
          this.failed.set(true);
          return of([] as Row[]);
        }),
      ),
    ).then((rows) => this.rows.set(rows ?? []));
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
}
