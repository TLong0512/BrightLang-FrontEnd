import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'https://localhost:7029/api/Book';

  constructor(private http: HttpClient) {}

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl+ '/myBook', { withCredentials: true });
  }

  getBook(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  getBooksByUserId(userId: string): Observable<Book[]> {
  return this.http.get<Book[]>(`${this.apiUrl}/user/${userId}`);
  }

  addBook(book: Partial<Book>): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, book, { withCredentials: true });
  }

  // updateBook(book: Book): Observable<void> {
  //   return this.http.put<Book>(`${this.apiUrl}/${book.id}`, book, { withCredentials: true });
  // }
  updateBook(book: Book): Observable<Book> {
  return this.http.put<Book>(`${this.apiUrl}/${book.id}`, book, { withCredentials: true });
}


  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
