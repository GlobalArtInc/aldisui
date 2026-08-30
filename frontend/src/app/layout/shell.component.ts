import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { UiButtonDirective } from '@globalart/platform-ui';
import { AuthService } from '../core/auth.service';
import { LanguageMenuComponent } from './language-menu.component';

@Component({
  selector: 'aldis-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet, TranslatePipe, UiButtonDirective, LanguageMenuComponent],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;

  signOut(): void {
    void this.auth.signOut();
  }
}
