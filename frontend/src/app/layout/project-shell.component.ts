import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import {
  UiButtonDirective,
  UiIconComponent,
  UiShellComponent,
  type UiNavSection,
} from '@globalart/platform-ui';
import { AuthService } from '../core/auth.service';
import { ProjectService } from '../core/project.service';

@Component({
  selector: 'aldis-project-shell',
  standalone: true,
  imports: [RouterOutlet, TranslatePipe, UiShellComponent, UiButtonDirective, UiIconComponent],
  templateUrl: './project-shell.component.html',
})
export class ProjectShellComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly projects = inject(ProjectService);
  private readonly translate = inject(TranslateService);

  readonly user = this.auth.user;
  readonly project = this.projects.current;
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
          { label: this.t('history'), icon: 'activity', route: `${base}/tasks` },
        ],
      },
      {
        label: this.t('project'),
        items: [
          { label: this.t('inventory'), icon: 'globe', route: `${base}/inventory` },
          { label: this.t('environment'), icon: 'variable', route: `${base}/environment` },
          { label: this.t('keyStore'), icon: 'key-round', route: `${base}/keys` },
          { label: this.t('repositories'), icon: 'copy', route: `${base}/repositories` },
          { label: this.t('schedule'), icon: 'refresh-cw', route: `${base}/schedules` },
          { label: this.t('integrations'), icon: 'radio', route: `${base}/integrations` },
        ],
      },
      {
        label: this.t('settings'),
        items: [
          { label: this.t('team'), icon: 'users', route: `${base}/team` },
          { label: this.t('runners'), icon: 'shield', route: `${base}/runners` },
        ],
      },
    ];
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      void this.projects.select(Number(params.get('id')));
    });
    const bump = () => this.labels.update((value) => value + 1);
    this.translate.onLangChange.subscribe(bump);
    this.translate.onTranslationChange.subscribe(bump);
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
