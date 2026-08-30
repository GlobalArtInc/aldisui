import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  UiAlertComponent,
  UiFieldDirective,
  UiInputDirective,
  UiLabelDirective,
  UiModalComponent,
  UiSwitchComponent,
  type UiModalConfig,
} from '@globalart/platform-ui';
import { ApiService } from '../../core/api.service';
import type { Project } from '../../core/models';
import { ProjectService } from '../../core/project.service';

export type ProjectDialogMode = 'create' | 'restore' | null;

@Component({
  selector: 'aldis-project-dialog',
  standalone: true,
  imports: [
    FormsModule,
    TranslatePipe,
    UiAlertComponent,
    UiFieldDirective,
    UiInputDirective,
    UiLabelDirective,
    UiModalComponent,
    UiSwitchComponent,
  ],
  templateUrl: './project-dialog.component.html',
})
export class ProjectDialogComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly projects = inject(ProjectService);
  private readonly translate = inject(TranslateService);

  @Input() set mode(value: ProjectDialogMode) {
    this.current.set(value);
    this.failed.set(false);

    if (value === 'create') {
      this.name.set('');
      this.parallel.set(0);
      this.alert.set(false);
    }

    if (value === 'restore') {
      this.backup.set('');
    }
  }

  @Output() readonly closed = new EventEmitter<void>();

  readonly current = signal<ProjectDialogMode>(null);
  readonly name = signal('');
  readonly parallel = signal(0);
  readonly alert = signal(false);
  readonly backup = signal('');
  readonly busy = signal(false);
  readonly failed = signal(false);

  readonly config = computed<UiModalConfig>(() => ({
    title: this.current() === 'restore' ? this.t('restoreProject') : this.t('newProject'),
    size: this.current() === 'restore' ? 'lg' : 'md',
    confirmButton: {
      label: this.current() === 'restore' ? this.t('restoreProject') : this.t('create'),
      variant: 'primary',
      loading: this.busy(),
    },
    closeButton: { label: this.t('cancel') },
  }));

  async action(id: string): Promise<void> {
    if (id !== 'confirm') {
      this.closed.emit();
      return;
    }

    this.busy.set(true);
    this.failed.set(false);

    try {
      const project =
        this.current() === 'restore' ? await this.restore() : await this.create();

      await this.projects.loadAll();
      this.closed.emit();

      if (project) {
        await this.router.navigate(['/project', project.id]);
      }
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }

  private create(): Promise<Project> {
    return firstValueFrom(
      this.api.post<Project>('projects', {
        name: this.name(),
        max_parallel_tasks: Number(this.parallel()),
        alert: this.alert(),
      }),
    );
  }

  private restore(): Promise<Project> {
    return firstValueFrom(this.api.post<Project>('projects/restore', JSON.parse(this.backup())));
  }

  private t(key: string): string {
    return this.translate.instant(key) as string;
  }
}
