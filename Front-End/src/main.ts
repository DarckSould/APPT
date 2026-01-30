import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, {
  ...appConfig,                      // 👈 usa app.config.ts
  providers: [
    ...(appConfig.providers ?? []),  // 👈 preserva HttpClient + interceptor
    provideRouter(routes),           // 👈 router aquí
  ],
}).catch(err => console.error(err));
