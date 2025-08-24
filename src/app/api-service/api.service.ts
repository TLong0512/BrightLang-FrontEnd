import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export class BaseService<T> {
  constructor(
    protected http: HttpClient,
    protected baseUrl: string
  ) {}

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(this.baseUrl);
  }

  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${id}`);
  }

  create(data: T): Observable<T> {
    return this.http.post<T>(this.baseUrl, data);
  }

  update(id: number, data: T): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
