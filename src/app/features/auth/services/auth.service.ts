import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { ResetPasswordDto } from '../../admin/models/auth.model';
import { EmailToVerifyDto } from '../../../models/email.model';
import { RegisterDto } from '../../../models/register.model';
import { MyAccountDto, UserState } from './user.state';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private role: string | null = null;
  private loggedIn = false;

  private readonly userState = inject(UserState);

  // private apiUrl = `${environment.apiUrlAuth}`;
  constructor(private http: HttpClient, private router: Router) { }

  login(email: string, password: string): Observable<MyAccountDto | null> {
    this.loggedIn = true;
    return this.http.post<MyAccountDto>(
      `/Authentication/login`, { email, password }
    ).pipe(
      tap(user => this.userState._next(user)),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) return of(null);
        if (err.status === 403) return of(null); // đây là khi đã đăng nhập rồi mà vẫn còn gọi hàm login.
        // trường hợp này thì mình phải gọi login.
        return throwError(() => err);
      })
    );
  }

  // logout() {
  //   return this.http.post(`${this.apiUrl}/Authentication/logout`, null, { withCredentials: true }).subscribe(() => {
  //     this.loggedIn = false;
  //     this.role = null;
  //     this.router.navigate(['/auth']);
  //   });
  // }

  logout(): Observable<boolean> {
    return this.http.post<void>(
      `/Authentication/logout`, {},
    ).pipe(
      tap(() => this.userState._next(null)),
      map(() => true),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 400) return of(false);
        if (err.status === 401) return of(false);
        return throwError(() => err);
      })
    );
  }

  // refresh() {
  //   console.log('refresh')
  //   return this.http.post(`${this.apiUrl}/Authentication/refresh`, null, { withCredentials: true });
  // }
  refresh(): Observable<MyAccountDto | null> {
    return this.http.post<MyAccountDto | null>(
      `/Authentication/refresh`, {},
    ).pipe(
      tap(asdf => console.log("Refresh called.", asdf, "End of refresh called.")),
      tap(myAccountDto => this.userState._next(myAccountDto)),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 400) return of(null);
        if (err.status === 401) return of(null);
        if (err.status === 409) return of(null);
        return throwError(() => err);
      })
    )
  }

  setRole(role: string) {
    this.role = role;
    this.loggedIn = true;
  }

  getRole() {
    return this.role;
  }

  isAuthenticated(): boolean {
    return this.loggedIn;
  }

  // Gọi API gửi OTP
  // sendOtp(data: string): Observable<any> {
  //   return this.http.post(`${environment.apiUrlAuth}/Authentication/reset-password-email-request`, { email: data });
  // }

  // resetPassword(data: ResetPasswordDto): Observable<any> {
  //   return this.http.post(`${environment.apiUrlAuth}/Authentication/reset-password`, data);
  // }

  sendOtp(dto: EmailToVerifyDto): Observable<boolean> {
    return this.http.post(
      `/Authentication/reset-password-email-request`, dto,
    ).pipe(
      map(() => true),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 200) return of(true);
        if (err.status === 400) return of(true);
        return throwError(() => err);
      })
    );
  }

  resetPassword(dto: ResetPasswordDto): Observable<boolean> {
    return this.http.post(
      `/Authentication/reset-password`, dto
    ).pipe(
      map(() => true),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 400) return of(false);
        if (err.status === 404) return of(false);
        if (err.status === 200) return of(true);
        return throwError(() => err);
      })
    );
  }

  // sendRegisterEmail(data: EmailToVerifyDto): Observable<any> {
  //   return this.http.post(`${environment.apiUrlAuth}/Authentication/register-email-request`, data, { withCredentials: true });
  // }

  // register(data: RegisterDto): Observable<any> {
  //   return this.http.post(`${environment.apiUrlAuth}/Authentication/register`, data);
  // }

  register(dto: RegisterDto): Observable<MyAccountDto | null> {
    return this.http.post<MyAccountDto | null>(`/Authentication/register`, dto).pipe(
      tap(user => this.userState._next(user)),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 409) return of(null);
        if (err.status === 100) return of(null);
        return throwError(() => err);
      })
    );
  }

  registerEmailRequest(dto: EmailToVerifyDto): Observable<boolean> {
    return this.http.post(`/Authentication/register-email-request`, dto).pipe(
      map(() => true),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 400) return of(true);
        if (err.status === 409) return of(false);
        return throwError(() => err);
      })
    );
  }
}
