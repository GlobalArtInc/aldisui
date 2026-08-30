import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type ApiParams = Record<string, string | number | boolean>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = 'api';

  get<T>(path: string, params?: ApiParams): Observable<T> {
    return this.http.get<T>(`${this.base}/${path}`, {
      withCredentials: true,
      params: this.toParams(params),
    });
  }

  post<T>(path: string, body?: unknown): Observable<T> {
    return this.http.post<T>(`${this.base}/${path}`, body ?? {}, { withCredentials: true });
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.base}/${path}`, body, { withCredentials: true });
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.base}/${path}`, { withCredentials: true });
  }

  private toParams(params?: ApiParams): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    let result = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      result = result.set(key, String(value));
    }
    return result;
  }
}
