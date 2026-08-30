import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TranslateLoader, type TranslationObject } from '@ngx-translate/core';
import { Observable, map } from 'rxjs';

const SINGLE_BRACE = /(?<![{])\{([a-zA-Z_][a-zA-Z0-9_]*)\}(?![}])/g;

@Injectable({ providedIn: 'root' })
export class AldisTranslateLoader implements TranslateLoader {
  private readonly http = inject(HttpClient);

  getTranslation(language: string): Observable<TranslationObject> {
    return this.http
      .get<Record<string, string>>(`assets/i18n/${language}.json`)
      .pipe(map((translations) => this.normalize(translations)));
  }

  private normalize(translations: Record<string, string>): TranslationObject {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(translations)) {
      result[key] = typeof value === 'string' ? value.replace(SINGLE_BRACE, '{{$1}}') : value;
    }

    return result as TranslationObject;
  }
}
