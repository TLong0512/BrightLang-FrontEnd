import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from '../models/exam.model';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseService<T> {
  protected baseUrl: string;

  constructor(
    protected http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    baseUrl?: string
  ) {
    this.baseUrl = baseUrl || '';
  }

  /**
   * Get cookie value by name - only works in browser
   */
  protected getCookie(name: string): string {
    // Check if running in browser
    if (!isPlatformBrowser(this.platformId)) {
      return '';
    }

    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || '';
      }
    } catch (error) {
      console.warn('Error reading cookie:', error);
    }
    return '';
  }

  /**
   * Get authentication headers
   */
  protected getAuthHeaders(): HttpHeaders {
    const token = this.getCookie('authToken') || this.getCookie('access_token') || this.getCookie('token');
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (token) {
      return headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Handle HTTP errors
   */
  protected handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại sau.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Dữ liệu không hợp lệ.';
          break;
        case 401:
          errorMessage = 'Bạn cần đăng nhập để sử dụng tính năng này.';
          break;
        case 403:
          errorMessage = 'Bạn không có quyền truy cập tính năng này.';
          break;
        case 404:
          errorMessage = 'Không tìm thấy dữ liệu yêu cầu.';
          break;
        case 500:
          errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
          break;
        default:
          errorMessage = `Lỗi: ${error.status} - ${error.message}`;
      }
    }

    console.error('HTTP Error:', error);
    return throwError(() => new Error(errorMessage));
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
