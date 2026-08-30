import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import type { Project } from './models';

const LAST_PROJECT_STORAGE_KEY = 'aldis.project';

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
    this.remember(id);

    if (this.current()?.id === id) {
      return this.current();
    }

    const project = await firstValueFrom(this.api.get<Project>(`project/${id}`));
    this.current.set(project ?? null);
    return this.current();
  }

  async active(): Promise<Project | null> {
    const projects = this.projects().length ? this.projects() : await this.loadAll();
    if (projects.length === 0) {
      return null;
    }

    const remembered = this.remembered();
    return projects.find((project) => project.id === remembered) ?? projects[0];
  }

  private remember(id: number): void {
    try {
      localStorage.setItem(LAST_PROJECT_STORAGE_KEY, String(id));
    } catch {
      return;
    }
  }

  private remembered(): number | null {
    try {
      const stored = Number(localStorage.getItem(LAST_PROJECT_STORAGE_KEY));
      return Number.isFinite(stored) && stored > 0 ? stored : null;
    } catch {
      return null;
    }
  }
}
