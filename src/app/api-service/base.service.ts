import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
    return this.http.get<ApiResponse<T[]>>(this.baseUrl).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  getById(id: string | number): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${id}`).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  create(data: T): Observable<T> {
    return this.http.post<ApiResponse<T>>(this.baseUrl, data).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  update(id: string | number, data: Partial<T>): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${id}`, data).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }

  delete(id: string | number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(
      map(response => this.extractData(response)),
      catchError(this.handleError)
    );
  }
}