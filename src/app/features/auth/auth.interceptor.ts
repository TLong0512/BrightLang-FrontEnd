import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshSubject = new BehaviorSubject<boolean>(false);

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(error => {
        console.log('error 19')
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshSubject.next(false);

      return this.auth.refresh().pipe(
        switchMap(() => {
          this.isRefreshing = false;
          this.refreshSubject.next(true);
          return next.handle(request);
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.auth.logout();
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshSubject.pipe(
        filter(done => done === true),
        take(1),
        switchMap(() => next.handle(request))
      );
    }
  }
}
