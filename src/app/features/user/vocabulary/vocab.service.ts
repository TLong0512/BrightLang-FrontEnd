import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vocabulary } from '../../../models/vocabulary.model';

@Injectable({
  providedIn: 'root'
})
export class VocabService {
  private apiUrl = 'https://localhost:7030/api/Vocabulary'; // backend API của bạn

  constructor(private http: HttpClient) {}

  // Lấy tất cả vocab theo bookId
  getVocabulariesByBook(bookId: string): Observable<Vocabulary[]> {
    return this.http.get<Vocabulary[]>(`${this.apiUrl}/book/${bookId}`);
  }

  // (Tuỳ chọn) Thêm từ vựng
  addVocabulary(vocab: Vocabulary): Observable<Vocabulary> {
    return this.http.post<Vocabulary>(this.apiUrl, vocab);
  }

  // (Tuỳ chọn) Xoá từ vựng
  deleteVocabulary(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // (Tuỳ chọn) Cập nhật từ vựng
  updateVocabulary(vocab: Vocabulary): Observable<Vocabulary> {
    return this.http.put<Vocabulary>(`${this.apiUrl}/${vocab.id}`, vocab);
  }
}
