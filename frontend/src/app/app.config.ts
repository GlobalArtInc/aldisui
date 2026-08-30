import { initialLanguage } from './core/languages';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { provideUiIcons } from '@globalart/platform-ui';
import { routes } from './app.routes';
import { AldisTranslateLoader } from './core/translate.loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideUiIcons(),
    provideTranslateService({
      loader: { provide: TranslateLoader, useClass: AldisTranslateLoader },
      fallbackLang: 'en',
      lang: initialLanguage(),
    }),
  ],
};
