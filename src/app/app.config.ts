import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './features/auth/auth.interceptor';
import { credentialInterceptor } from './features/auth/add-credentials.interceptor';
import { apiInterceptor } from './features/auth/api.interceptor';
import { UserState } from './features/auth/services/user.state';
import { AuthService } from './features/auth/services/auth.service';
import { firstValueFrom } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    //provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    //provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi(),
      withInterceptors([
        apiInterceptor,
        credentialInterceptor
      ])),
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: AuthInterceptor,
    //   multi: true
    // },
    provideAppInitializer(() => {
      // const userState = inject(UserState);
      const authService = inject(AuthService);
      return firstValueFrom(authService.refresh()); // angular waits.
    })
  ]
};
