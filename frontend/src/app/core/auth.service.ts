import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';

export interface OidcProvider {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface LdapProvider {
  id: string;
  name: string;
}

export interface LoginMetadata {
  oidc_providers: OidcProvider[];
  ldap_providers: LdapProvider[];
  login_with_password: boolean;
  login_with_ldap: boolean;
}

export interface CurrentUser {
  id: number;
  name: string;
  username: string;
  email: string;
  admin: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly currentUser = signal<CurrentUser | null>(null);

  readonly user = computed(() => this.currentUser());
  readonly signedIn = computed(() => this.currentUser() !== null);

  metadata(): Promise<LoginMetadata> {
    return firstValueFrom(this.api.get<LoginMetadata>('auth/login'));
  }

  async signInWithPassword(auth: string, password: string): Promise<void> {
    await firstValueFrom(this.api.post('auth/login', { auth, password, method: 'password' }));
    await this.refresh();
  }

  async signInWithLdap(auth: string, password: string, provider: string): Promise<void> {
    await firstValueFrom(this.api.post('auth/login', { auth, password, method: 'ldap', provider }));
    await this.refresh();
  }

  startOidc(provider: string): void {
    document.location.href = `${document.baseURI}api/auth/oidc/${provider}/login`;
  }

  async refresh(): Promise<CurrentUser | null> {
    try {
      const user = await firstValueFrom(this.api.get<CurrentUser>('user'));
      this.currentUser.set(user);
      return user;
    } catch {
      this.currentUser.set(null);
      return null;
    }
  }

  async signOut(): Promise<void> {
    await firstValueFrom(this.api.post('auth/logout', {}));
    this.currentUser.set(null);
    await this.router.navigate(['/login']);
  }
}
