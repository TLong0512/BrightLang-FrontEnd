import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseService } from '../../../../api-service/base.service';
import { ExamData, ExamLevel, ExamResult, ExamSubmission } from '../../../../models/exam.model';

@Injectable({
  providedIn: 'root'
})
export class ExamService extends BaseService<ExamData> {
  constructor() {
    super('https://localhost:7029/api/exam');
  }

  getExamByLevel(level: string): Observable<ExamData> {
    return this.http.get<ExamData>(`${this.baseUrl}/level/${level}`).pipe(
      catchError(this.handleError)
    );
  }

  submitExam(submission: ExamSubmission): Observable<ExamResult> {
    return this.http.post<ExamResult>(`${this.baseUrl}/submit`, submission).pipe(
      catchError(this.handleError)
    );
  }

  getExamLevels(): Observable<ExamLevel[]> {
    return this.http.get<ExamLevel[]>(`${this.baseUrl}/levels`).pipe(
      catchError(this.handleError)
    );
  }

  getExamSettings(examId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${examId}/settings`).pipe(
      catchError(this.handleError)
    );
  }

  saveProgress(examId: string, progress: any): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${examId}/progress`, progress).pipe(
      catchError(this.handleError)
    );
  }
}
