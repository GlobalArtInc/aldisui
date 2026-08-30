import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import {
  UiAvatarComponent,
  UiButtonDirective,
  UiIconComponent,
  UiMenuComponent,
  UiMenuItemDirective,
  UiShellComponent,
  type UiNavSection,
} from '@globalart/platform-ui';
import { ApiService } from '../core/api.service';
import { LanguageMenuComponent } from './language-menu.component';
import { AuthService } from '../core/auth.service';
import { ProjectService } from '../core/project.service';

@Component({
  selector: 'aldis-project-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    TranslatePipe,
    UiShellComponent,
    UiAvatarComponent,
    UiButtonDirective,
    UiIconComponent,
    UiMenuComponent,
    UiMenuItemDirective,
    LanguageMenuComponent,
  ],
  templateUrl: './project-shell.component.html',
})
export class ProjectShellComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly projects = inject(ProjectService);
  private readonly translate = inject(TranslateService);

  readonly user = this.auth.user;
  readonly project = this.projects.current;
  readonly role = signal<string>('');
  readonly projectId = toSignal(this.route.paramMap.pipe(map((params) => Number(params.get('id')))), {
    initialValue: 0,
  });

  private readonly labels = signal(0);

  readonly sections = computed<UiNavSection[]>(() => {
    this.labels();
    const base = `/project/${this.projectId()}`;

    return [
      {
        items: [
          { label: this.t('dashboard'), icon: 'layout-dashboard', route: base },
          { label: this.t('taskTemplates'), icon: 'file-text', route: `${base}/templates` },
          { label: this.t('schedule'), icon: 'refresh-cw', route: `${base}/schedules` },
          { label: this.t('inventory'), icon: 'globe', route: `${base}/inventory` },
          { label: this.t('environment'), icon: 'variable', route: `${base}/environment` },
          { label: this.t('keyStore'), icon: 'key-round', route: `${base}/keys` },
          { label: this.t('repositories'), icon: 'copy', route: `${base}/repositories` },
          { label: this.t('integrations'), icon: 'radio', route: `${base}/integrations` },
          { label: this.t('team'), icon: 'users', route: `${base}/team` },
        ],
      },
    ];
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      void this.projects.select(id);
      void firstValueFrom(this.api.get<{ role: string }>(`project/${id}/role`))
        .then((result) => this.role.set(result?.role ?? ''))
        .catch(() => this.role.set(''));
    });
    const bump = () => this.labels.update((value) => value + 1);
    this.translate.onLangChange.subscribe(bump);
    this.translate.onTranslationChange.subscribe(bump);

    if (this.projects.projects().length === 0) {
      void this.projects.loadAll();
    }
  }

  readonly all = this.projects.projects;

  goToProject(id: number): void {
    void this.router.navigate(['/project', id]);
  }

  goToProjects(): void {
    void this.router.navigate(['/']);
  }

  signOut(): void {
    void this.auth.signOut();
  }

  private t(key: string): string {
    return this.translate.instant(key) as string;
  }
}
