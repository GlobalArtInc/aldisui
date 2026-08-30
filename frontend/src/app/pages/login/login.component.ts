import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  UiAlertComponent,
  UiButtonDirective,
  UiCardComponent,
  UiFormFieldComponent,
  UiInputDirective,
} from '@globalart/platform-ui';
import { AuthService, LoginMetadata } from '../../core/auth.service';

@Component({
  selector: 'aldis-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    UiAlertComponent,
    UiButtonDirective,
    UiCardComponent,
    UiFormFieldComponent,
    UiInputDirective,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly metadata = signal<LoginMetadata | null>(null);
  readonly failed = signal(false);
  readonly busy = signal(false);

  readonly form = this.fb.nonNullable.group({
    auth: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor() {
    void this.auth.metadata().then((metadata) => this.metadata.set(metadata));
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.busy()) {
      return;
    }

    this.busy.set(true);
    this.failed.set(false);

    const { auth, password } = this.form.getRawValue();

    try {
      await this.auth.signInWithPassword(auth, password);
      await this.router.navigate(['/']);
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }

  signInWith(provider: string): void {
    this.auth.startOidc(provider);
  }
}
