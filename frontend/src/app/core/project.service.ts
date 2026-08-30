import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import type { Project } from './models';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly api = inject(ApiService);

  readonly projects = signal<Project[]>([]);
  readonly current = signal<Project | null>(null);

  async loadAll(): Promise<Project[]> {
    const projects = (await firstValueFrom(this.api.get<Project[]>('projects'))) ?? [];
    this.projects.set(projects);
    return projects;
  }

  async select(id: number): Promise<Project | null> {
    if (this.current()?.id === id) {
      return this.current();
    }

    const project = await firstValueFrom(this.api.get<Project>(`project/${id}`));
    this.current.set(project ?? null);
    return this.current();
  }
}
