import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ExamType, Level, SkillLevel, Range, Context, Question, Answer, QuestionAdd, QuestionPage, QuestionDto, QuestionUpdate } from '../models/question-bank.model';

@Injectable({
  providedIn: 'root' // hoặc chỉ trong UserModule
})
export class QuestionBankApiService {
  
  constructor(private http: HttpClient) { }

  getExamTypes(): Observable<ExamType[]> {
    return this.http.get<ExamType[]>(`/ExamType`);
  }

  getLevelsByExamTypeId(id: string): Observable<Level[]> {
    return this.http.get<Level[]>(`/level/filter/exam-type/${id}`);
  }

  getSkillLevelsByLevelId(id: string): Observable<SkillLevel[]> {
    return this.http.get<SkillLevel[]>(`/SkillLevel/filter/level/${id}`);
  }

  getRangesBySkillLevelId(id: string): Observable<Range[]> {
    return this.http.get<Range[]>(`/Range/filter/skill-level/${id}`);
  }

  postRange(range: Range): Observable<Range> {
    return this.http.post<Range>(`/Range`, range, { withCredentials: true });
  }

  updateRange(id: string, range: Range): Observable<void> {
    return this.http.put<void>(`/Range/${id}`, range, { withCredentials: true });
  }

  deleteRange(id: string): Observable<void> {
    return this.http.delete<void>(`/Range/${id}`, { withCredentials: true });
  }

  getRangeById(id: string): Observable<Range> {
    return this.http.get<Range>(`/Range/${id}`, { withCredentials: true })
  }

  // Context
  getContextsByRangeId(id: string): Observable<Context[]> {
    return this.http.get<Context[]>(`/Context/range/${id}`);
  }

  getContextById(id: string): Observable<Context> {
    return this.http.get<Context>(`/Context/${id}`);
  }

  postContext(context: Context): Observable<string> {
    return this.http.post<string>(`/Context`, context, { withCredentials: true });
  }

  updateContext(id: string, context: Context): Observable<void> {
    return this.http.put<void>(`/Context/${id}`, context, { withCredentials: true });
  }

  deleteContext(id: string): Observable<void> {
    return this.http.delete<void>(`/Context/${id}`, { withCredentials: true });
  }

  // Question
  getAllQuestions(): Observable<QuestionPage> {
    return this.http.get<QuestionPage>(`/Question/${1}/${10}`)
  }
  getQuestionsByContextId(id: string): Observable<Question[]> {
    return this.http.get<Question[]>(`/Question/filter/context/${id}`, { withCredentials: true });
  }

  getQuestionById(id: string): Observable<QuestionDto> { 
    return this.http.get<QuestionDto>(`/Question/${id}`, { withCredentials: true });
  }

  postQuestion(examTypeId: string, skillId: string, questions: QuestionAdd[]): Observable<void> {
    return this.http.post<void>(`/Question/quick-add/skill/${skillId}/exam-type/${examTypeId}`, questions, { withCredentials: true });
  }
  updateQuestion(id: string, question: QuestionUpdate): Observable<void> {
    return this.http.put<void>(`/Question/${id}`, question, { withCredentials: true });
  }

  deleteQuestion(id: string): Observable<void> {
    return this.http.delete<void>(`/Question/${id}`);
  }

  // Answer
  getAnswersByQuestionId(id: string): Observable<Answer[]> {
    return this.http.get<Answer[]>(`/Answer/anser-in-question/${id}`);
  }
  getAnswerById(id: string): Observable<Answer> {
    return this.http.get<Answer>(`/Answer/${id}`, { withCredentials: true });
  }

  postAnswer(answer: Answer): Observable<void> {
    return this.http.post<void>(`/Answer`, answer, { withCredentials: true });
  }
  updateAnswer(id: string, answer: Answer): Observable<void> {
    return this.http.put<void>(`/Answer/${id}`, answer, { withCredentials: true });
  }
}
