import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from '../models/exam.model';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseService<T> {
  protected http = inject(HttpClient);
  
  constructor(protected baseUrl: string) {}

  /** Lấy token từ cookie */
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  /** Sinh headers kèm Authorization nếu có token */
  protected getAuthHeaders(): HttpHeaders {
    const token = this.getCookie('AccessToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  protected handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Service Error:', error);
    return throwError(() => error);
  }

  protected extractData<U>(response: ApiResponse<U>): U {
    if (!response.success) {
      throw new Error(response.message || 'API Error');
    }
    return response.data;
  }

  getAll(): Observable<T[]> {
    return this.http.get<ApiResponse<T[]>>(this.baseUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  getById(id: string | number): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  create(data: T): Observable<T> {
    return this.http.post<ApiResponse<T>>(this.baseUrl, data, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  update(id: string | number, data: Partial<T>): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${id}`, data, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  delete(id: string | number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }
}
