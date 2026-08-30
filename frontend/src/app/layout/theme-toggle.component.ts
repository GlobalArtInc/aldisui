import { Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { UiButtonDirective, UiIconComponent, UiThemeService } from '@globalart/platform-ui';

@Component({
  selector: 'aldis-theme-toggle',
  standalone: true,
  imports: [TranslatePipe, UiButtonDirective, UiIconComponent],
  template: `
    <button
      uiButton
      variant="ghost"
      size="icon-sm"
      type="button"
      [attr.aria-label]="'theme' | translate"
      [attr.title]="'theme' | translate"
      (click)="toggle()">
      <ui-icon [name]="icon()" [size]="15"></ui-icon>
    </button>
  `,
})
export class ThemeToggleComponent {
  private readonly theme = inject(UiThemeService);

  readonly icon = computed(() => (this.theme.theme() === 'dark' ? 'sun' : 'moon'));

  toggle(): void {
    this.theme.toggle();
  }
}
