import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiThemeService } from '@globalart/platform-ui';

@Component({
  selector: 'aldis-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class AppComponent {
  constructor() {
    inject(UiThemeService).init();
  }
}
