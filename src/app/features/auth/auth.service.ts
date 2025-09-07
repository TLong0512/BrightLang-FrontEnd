import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private role: string | null = null;
  private loggedIn = false;

  private apiUrl = `${environment.apiUrlAuth}`;
  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Authentication/login`, { email, password }, { withCredentials: true })
  }

  logout() {
    return this.http.post(`${this.apiUrl}/Authentication/logout`, {}, { withCredentials: true }).subscribe(() => {
      this.loggedIn = false;
      this.role = null;
      this.router.navigate(['/login']);
    });
  }

  refresh() {
    console.log('refresh')
    return this.http.post(`${this.apiUrl}/Authentication/refresh`, null, { withCredentials: true });
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
}
