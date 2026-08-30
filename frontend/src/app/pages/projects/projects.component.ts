import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  UiBadgeComponent,
  UiCardComponent,
  UiEmptyStateComponent,
  UiIconComponent,
  UiPageHeaderComponent,
  UiSpinnerComponent,
} from '@globalart/platform-ui';
import type { Project } from '../../core/models';
import { ProjectService } from '../../core/project.service';

@Component({
  selector: 'aldis-projects',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    TranslatePipe,
    UiBadgeComponent,
    UiCardComponent,
    UiEmptyStateComponent,
    UiIconComponent,
    UiPageHeaderComponent,
    UiSpinnerComponent,
  ],
  templateUrl: './projects.component.html',
})
export class ProjectsComponent {
  private readonly service = inject(ProjectService);

  readonly projects = signal<Project[]>([]);
  readonly loading = signal(true);

  constructor() {
    void this.service
      .loadAll()
      .then((projects) => this.projects.set(projects))
      .finally(() => this.loading.set(false));
  }
}
