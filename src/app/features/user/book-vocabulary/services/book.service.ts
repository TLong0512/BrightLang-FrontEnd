import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Book {
  id: string;
  name: string;
  description?: string;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})

export class BookService {
  private apiUrl = `${environment.apiUrlBook}`

  constructor(private http: HttpClient) { }

  getBooks(): Observable<Book[]> {
    return this.http
      .get<{ items: Book[] }>(`${this.apiUrl}/myBook`, { withCredentials: true })
      .pipe(
        map(response => {
          return response.items.sort((a, b) => a.name.localeCompare(b.name));
        })
      );
  }

  getBook(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  addBook(book: Partial<Book>): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, book, { withCredentials: true });
  }

  updateBook(book: Book): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${book.id}`, book, { withCredentials: true });
  }

  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
