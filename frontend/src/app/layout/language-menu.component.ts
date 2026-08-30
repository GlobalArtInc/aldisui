import { Component, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  UiButtonDirective,
  UiIconComponent,
  UiMenuComponent,
  UiMenuItemDirective,
} from '@globalart/platform-ui';
import { LANGUAGES, storeLanguage } from '../core/languages';

@Component({
  selector: 'aldis-language-menu',
  standalone: true,
  imports: [UiButtonDirective, UiIconComponent, UiMenuComponent, UiMenuItemDirective],
  template: `
    <ui-menu align="end" width="200px">
      <button menuTrigger uiButton variant="ghost" size="sm" type="button" class="flex items-center gap-2">
        <ui-icon name="languages" [size]="15"></ui-icon>
        <span class="hidden sm:inline">{{ label() }}</span>
      </button>

      <div menuContent>
        @for (language of languages; track language.code) {
          <button uiMenuItem type="button" (click)="use(language.code)">{{ language.label }}</button>
        }
      </div>
    </ui-menu>
  `,
})
export class LanguageMenuComponent {
  private readonly translate = inject(TranslateService);

  readonly languages = LANGUAGES;
  readonly label = signal(this.labelOf(this.translate.getCurrentLang() ?? 'en'));

  use(code: string): void {
    this.translate.use(code);
    this.label.set(this.labelOf(code));
    storeLanguage(code);
  }

  private labelOf(code: string): string {
    return LANGUAGES.find((language) => language.code === code)?.label ?? 'English';
  }
}
