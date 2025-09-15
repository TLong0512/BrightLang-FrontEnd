import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ExamType, Level, SkillLevel, Range, Context, Question, Answer, QuestionAdd, QuestionPage, QuestionDto, QuestionUpdate } from '../models/question-bank.model';

@Injectable({
  providedIn: 'root' // hoặc chỉ trong UserModule
})
export class ExamTypeService {
  
  constructor(private http: HttpClient) { }

  getExamTypes(): Observable<ExamType[]> {
    return this.http.get<ExamType[]>(`/ExamType`);
  }

  addExamTypes(examType: ExamType): Observable<void> {
    return this.http.post<void>(`/ExamType`, examType);
  }
  updateExamType(examType: ExamType): Observable<void> {
    return this.http.put<void>(`/ExamType/${examType.id}`, examType);
  }
  deleteExamType(id: string): Observable<void> {
    return this.http.delete<void>(`/ExamType/${id}`);
  }

  
}
