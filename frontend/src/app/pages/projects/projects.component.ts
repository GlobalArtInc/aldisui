import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { UiCardComponent } from '@globalart/platform-ui';
import { ApiService } from '../../core/api.service';

export interface Project {
  id: number;
  name: string;
  created: string;
}

@Component({
  selector: 'aldis-projects',
  standalone: true,
  imports: [RouterLink, TranslatePipe, UiCardComponent],
  templateUrl: './projects.component.html',
})
export class ProjectsComponent {
  private readonly api = inject(ApiService);

  readonly projects = signal<Project[]>([]);
  readonly loaded = signal(false);

  constructor() {
    void firstValueFrom(this.api.get<Project[]>('projects'))
      .then((projects) => this.projects.set(projects ?? []))
      .finally(() => this.loaded.set(true));
  }
}
